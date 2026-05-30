"""
Unlock Event Study — Price Impact Backtest
------------------------------------------
Infers unlock events from circulating supply changes.
- Price data: Binance API (free, no key)
- Supply data: CoinGecko Demo API (free key — get at coingecko.com/api)

Setup:
    pip install -r requirements.txt
    cp .env.example .env
    Add COINGECKO_DEMO_KEY to .env  (free at coingecko.com/api → Demo plan)

Usage:
    python3 backtest.py                              # default token list
    python3 backtest.py --tokens celestia aptos optimism near
    python3 backtest.py --min-unlock-pct 2.0
"""

import os
import time
import argparse
import json
from datetime import datetime, timedelta, timezone

from pathlib import Path

import requests
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # non-interactive backend — saves file without needing display
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

CG_DEMO_KEY = os.environ.get("COINGECKO_DEMO_KEY", "")
CG_BASE = "https://api.coingecko.com/api/v3"
BINANCE_BASE = "https://api.binance.com/api/v3"

BENCHMARK_BINANCE = "BTCUSDT"
BENCHMARK_CG = "bitcoin"

PRE  = 30
POST = 365   # extended to 1 year
EVENT_DAYS = list(range(-PRE, POST + 1))

# Specific checkpoints for the extended summary table
CHECKPOINTS = [-7, 0, 7, 30, 90, 180, 365]

CLIFF_THRESHOLD_PCT = 0.8   # min single-day supply % jump to count as cliff unlock
MIN_UNLOCK_PCT = 0.5

# CoinGecko ID → Binance symbol mapping
# Add/edit as needed — CoinGecko ID on left, Binance USDT pair symbol on right
SYMBOL_MAP = {
    "hyperliquid":              None,       # not on Binance spot, skip price
    "celestia":                 "TIAUSDT",
    "aptos":                    "APTUSDT",
    "optimism":                 "OPUSDT",
    "sui":                      "SUIUSDT",
    "near":                     "NEARUSDT",
    "render-token":             "RENDERUSDT",
    "bittensor":                "TAOUSDT",
    "virtual-protocol":         "VIRTUALUSDT",
    "arbitrum":                 "ARBUSDT",
    "starknet":                 "STRKUSDT",
    "worldcoin-wld":            "WLDUSDT",
    "dydx-chain":               "DYDXUSDT",
    "jupiter-exchange-solana":  "JUPUSDT",
    "pendle":                   "PENDLEUSDT",
    "ethena":                   "ENAUSDT",
    "solana":                   "SOLUSDT",
    "ethereum":                 "ETHUSDT",
    "bitcoin":                  "BTCUSDT",
}

DEFAULT_TOKENS = [k for k, v in SYMBOL_MAP.items() if v is not None and k != "bitcoin"]


# ─────────────────────────────────────────────────────────────────────────────
# BINANCE — PRICE DATA (free, no key)
# ─────────────────────────────────────────────────────────────────────────────

def get_binance_daily(symbol: str, days: int = 365) -> pd.DataFrame | None:
    """Fetch daily OHLCV from Binance. Returns DataFrame indexed by date string."""
    limit = min(days, 1000)
    end_ts = int(datetime.now(timezone.utc).timestamp() * 1000)
    start_ts = end_ts - days * 86400 * 1000

    for attempt in range(3):
        try:
            r = requests.get(f"{BINANCE_BASE}/klines", params={
                "symbol": symbol,
                "interval": "1d",
                "startTime": start_ts,
                "endTime": end_ts,
                "limit": limit,
            }, timeout=30)
            if r.status_code == 429:
                time.sleep(30)
                continue
            r.raise_for_status()
            data = r.json()
            if not data:
                return None
            df = pd.DataFrame(data, columns=[
                "open_time", "open", "high", "low", "close", "volume",
                "close_time", "quote_vol", "trades", "taker_buy_base",
                "taker_buy_quote", "ignore"
            ])
            df["date"] = pd.to_datetime(df["open_time"], unit="ms").dt.date.astype(str)
            df["price"] = df["close"].astype(float)
            df = df.set_index("date")[["price"]]
            return df
        except Exception as e:
            if attempt == 2:
                return None
            time.sleep(5)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# COINGECKO — SUPPLY DATA (demo key required)
# ─────────────────────────────────────────────────────────────────────────────

def cg_headers() -> dict:
    return {"x-cg-demo-api-key": CG_DEMO_KEY} if CG_DEMO_KEY else {}


def cg_get(endpoint: str, params: dict = {}) -> dict | list | None:
    for attempt in range(3):
        try:
            r = requests.get(f"{CG_BASE}/{endpoint}", params=params,
                             headers=cg_headers(), timeout=30)
            if r.status_code == 429:
                wait = int(r.headers.get("Retry-After", 60))
                time.sleep(wait)
                continue
            if r.status_code in (401, 403):
                print(f"\n  CoinGecko auth error — add COINGECKO_DEMO_KEY to .env")
                print(f"  Get a free key at: https://www.coingecko.com/en/api\n")
                return None
            if r.status_code == 404:
                return None
            r.raise_for_status()
            time.sleep(1.5)
            return r.json()
        except Exception as e:
            if attempt == 2:
                return None
            time.sleep(5)
    return None


def get_supply_history(cg_id: str, days: int = 365) -> pd.Series | None:
    """
    Infer circulating supply history from CoinGecko market cap / price.
    Returns Series indexed by date string.
    """
    data = cg_get(f"coins/{cg_id}/market_chart", {
        "vs_currency": "usd",
        "days": days,
    })
    if not data:
        return None

    prices = pd.DataFrame(data.get("prices", []), columns=["ts", "price"])
    mcaps = pd.DataFrame(data.get("market_caps", []), columns=["ts", "mcap"])

    if prices.empty or mcaps.empty:
        return None

    df = prices.copy()
    df["mcap"] = mcaps["mcap"].values[:len(df)] if len(mcaps) >= len(df) else np.nan
    df["date"] = pd.to_datetime(df["ts"], unit="ms").dt.date.astype(str)
    df = df.drop_duplicates("date").set_index("date")
    df["supply"] = df["mcap"] / df["price"]
    return df["supply"].dropna()


# ─────────────────────────────────────────────────────────────────────────────
# UNLOCK DETECTION
# ─────────────────────────────────────────────────────────────────────────────

def detect_cliff_unlocks(supply: pd.Series, min_pct: float) -> list[dict]:
    pct_change = supply.pct_change() * 100
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    events = []
    for date, pct in pct_change.items():
        if date >= today:
            continue
        if pct >= CLIFF_THRESHOLD_PCT and pct >= min_pct:
            events.append({
                "date": date,
                "unlock_pct": round(float(pct), 3),
                "size_bucket": classify_size(pct),
            })
    return events


def classify_size(pct: float) -> str:
    if pct < 1:    return "small (<1%)"
    elif pct < 3:  return "medium (1–3%)"
    elif pct < 10: return "large (3–10%)"
    else:          return "very large (>10%)"


# ─────────────────────────────────────────────────────────────────────────────
# EVENT STUDY
# ─────────────────────────────────────────────────────────────────────────────

def compute_ar(token_df: pd.DataFrame, bench_df: pd.DataFrame, event_date: str) -> dict | None:
    """
    Compute abnormal returns for each day in EVENT_DAYS.
    Returns partial dict — missing days are simply absent (not None).
    Returns None only if T0 itself has no data (event is unusable).
    """
    event_dt = datetime.strptime(event_date, "%Y-%m-%d").date()
    ar = {}
    for offset in EVENT_DAYS:
        d = str(event_dt + timedelta(days=offset))
        d_prev = str(event_dt + timedelta(days=offset - 1))
        if d not in token_df.index or d_prev not in token_df.index:
            continue  # skip missing days, don't discard whole event
        if d not in bench_df.index or d_prev not in bench_df.index:
            continue
        t_ret = (token_df.loc[d, "price"] / token_df.loc[d_prev, "price"]) - 1
        b_ret = (bench_df.loc[d, "price"] / bench_df.loc[d_prev, "price"]) - 1
        ar[offset] = t_ret - b_ret

    # Must have T0 data to be usable
    if 0 not in ar:
        return None
    return ar


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def run_backtest(tokens: list[str], min_unlock_pct: float):
    print("\nFetching BTC benchmark prices (Binance)...")
    bench_df = get_binance_daily("BTCUSDT", days=900)  # ~2.5yr for full year post-window
    if bench_df is None or bench_df.empty:
        print("Failed to fetch BTC from Binance. Check connection.")
        return
    print(f"  BTC: {len(bench_df)} days loaded\n")

    if not CG_DEMO_KEY:
        print("WARNING: COINGECKO_DEMO_KEY not set. Supply data will fail.")
        print("Get a free key at https://www.coingecko.com/en/api\n")

    all_events = []

    for cg_id in tqdm(tokens, desc="Processing tokens"):
        binance_sym = SYMBOL_MAP.get(cg_id)
        if not binance_sym:
            continue

        # Price data from Binance — fetch full history for long post-windows
        token_df = get_binance_daily(binance_sym, days=900)
        if token_df is None or len(token_df) < PRE + POST + 10:
            continue

        # Supply history from CoinGecko
        supply = get_supply_history(cg_id, days=365)
        if supply is None or len(supply) < 60:
            continue

        # Detect cliff unlocks
        unlocks = detect_cliff_unlocks(supply, min_pct=min_unlock_pct)
        if not unlocks:
            tqdm.write(f"  {cg_id}: no unlocks detected above {min_unlock_pct}%")
            continue

        tqdm.write(f"  {cg_id}: {len(unlocks)} unlock events found")

        for event in unlocks:
            ar = compute_ar(token_df, bench_df, event["date"])
            if ar is None:
                continue
            all_events.append({
                "token": cg_id,
                "date": event["date"],
                "unlock_pct": event["unlock_pct"],
                "size_bucket": event["size_bucket"],
                "ar": ar,
            })

    print(f"\n✓ {len(all_events)} unlock events analysed across {len(set(e['token'] for e in all_events))} tokens\n")

    if not all_events:
        print("No events found. Try lowering --min-unlock-pct.")
        return

    results = aggregate(all_events)
    print_table(results)
    plot(results, all_events)
    save(results, all_events)


def cum_ar_at(mat: pd.DataFrame, day: int) -> tuple[float, int] | None:
    """Cumulative AR from T0 to T+day. Returns (value, n_events_with_data)."""
    cols = [d for d in range(0, day + 1) if d in mat.columns]
    if not cols:
        return None
    sub = mat[cols].dropna(how="any")
    if sub.empty:
        return None
    return float(sub.sum(axis=1).mean()), len(sub)


def aggregate(events: list[dict]) -> dict:
    segments = {
        "all":               events,
        "small (<1%)":       [e for e in events if e["size_bucket"] == "small (<1%)"],
        "medium (1–3%)":     [e for e in events if e["size_bucket"] == "medium (1–3%)"],
        "large (3–10%)":     [e for e in events if e["size_bucket"] == "large (3–10%)"],
        "very large (>10%)": [e for e in events if e["size_bucket"] == "very large (>10%)"],
    }
    out = {}
    for name, evts in segments.items():
        if not evts:
            continue
        mat = pd.DataFrame([e["ar"] for e in evts])

        # Cumulative AR at each checkpoint (T+7, T+30, T+90, T+180, T+365)
        checkpoints = {}
        for cp in [7, 30, 90, 180, 365]:
            result = cum_ar_at(mat, cp)
            checkpoints[cp] = result  # (value, n) or None

        valid_pre = [d for d in range(-7, 0) if d in mat.columns]

        out[name] = {
            "n":             len(evts),
            "mean_ar":       mat.mean(),
            "cumulative_ar": mat.mean().cumsum(),
            "t0_mean":       float(mat[0].mean()),
            "t0_pct_neg":    float((mat[0] < 0).mean()),
            "pre7_mean":     float(mat[valid_pre].mean().mean()) if valid_pre else None,
            "checkpoints":   checkpoints,
        }
    return out


def fmt_cp(val_n) -> str:
    if val_n is None:
        return "      —"
    val, n = val_n
    return f"{val*100:>+6.1f}% (n={n})"


def print_table(results: dict):
    print("=" * 115)
    print("UNLOCK EVENT STUDY — CUMULATIVE ABNORMAL RETURNS vs BTC")
    print("Cumulative AR = sum of daily (token - BTC) returns from T0 to checkpoint")
    print("=" * 115)
    print(f"{'Segment':<22} {'N':>5}  {'T0':>8}  {'Pre-7d':>8}  {'→T+7':>14}  {'→T+30':>14}  {'→T+90':>14}  {'→T+180':>14}  {'→T+365':>14}  {'%Neg T0':>8}")
    print("-" * 115)
    for seg, r in results.items():
        pre = f"{r['pre7_mean']*100:>+7.2f}%" if r["pre7_mean"] is not None else "      —"
        cps = [fmt_cp(r["checkpoints"].get(cp)) for cp in [7, 30, 90, 180, 365]]
        print(
            f"{seg:<22} {r['n']:>5}  "
            f"{r['t0_mean']*100:>+7.2f}%  "
            f"{pre}  "
            + "  ".join(cps) +
            f"  {r['t0_pct_neg']*100:>6.0f}%"
        )
    print()


def plot(results: dict, events: list[dict]):
    fig = plt.figure(figsize=(16, 10))
    fig.suptitle("Token Unlock Event Study — Abnormal Price Impact vs BTC", fontsize=13, fontweight="bold")
    gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.45, wspace=0.35)

    # 1. CAR by size bucket — focus on first 90 days (most data)
    ax1 = fig.add_subplot(gs[0, 0])
    for seg in ["small (<1%)", "medium (1–3%)", "large (3–10%)", "very large (>10%)"]:
        if seg in results:
            r = results[seg]
            car = r["cumulative_ar"]
            x = [d for d in car.index if isinstance(d, (int, float)) and -PRE <= d <= 90]
            y = [car[d] * 100 for d in x]
            ax1.plot(x, y, label=f"{seg} (n={r['n']})")
    ax1.axvline(0, color="red", linestyle="--", alpha=0.5, linewidth=1.2)
    ax1.axhline(0, color="black", alpha=0.3)
    ax1.set_title("Cumulative AR by Unlock Size (T-30 to T+90)")
    ax1.set_xlabel("Days relative to unlock")
    ax1.set_ylabel("Cumulative AR (%)")
    ax1.legend(fontsize=8)
    ax1.grid(alpha=0.25)

    # 2. All events CAR + 95% CI (T-30 to T+180)
    ax2 = fig.add_subplot(gs[0, 1])
    if "all" in results:
        mat = pd.DataFrame([e["ar"] for e in events])
        # Limit to days with enough data (at least 5 events)
        sufficient = [d for d in mat.columns if mat[d].notna().sum() >= 5]
        mat_s = mat[sufficient]
        mean_car = mat_s.mean().cumsum() * 100
        se = mat_s.sem().cumsum() * 100
        x = list(mean_car.index)
        ax2.plot(x, mean_car.values, color="steelblue", linewidth=2, label="Mean CAR")
        ax2.fill_between(x, (mean_car - 1.96*se).values, (mean_car + 1.96*se).values,
                         alpha=0.2, color="steelblue", label="95% CI")
        ax2.axvline(0, color="red", linestyle="--", alpha=0.5, linewidth=1.2)
        ax2.axhline(0, color="black", alpha=0.3)
        ax2.set_title(f"All Events (n={results['all']['n']}) — CAR + 95% CI")
        ax2.set_xlabel("Days relative to unlock")
        ax2.set_ylabel("Cumulative AR (%)")
        ax2.legend(fontsize=8)
        ax2.grid(alpha=0.25)

    # 3. Mean daily AR bar (T-14 to T+14)
    ax3 = fig.add_subplot(gs[1, 0])
    if "all" in results:
        focus = list(range(-14, 15))
        vals = [results["all"]["mean_ar"].get(d, 0) * 100 for d in focus]
        colors = ["#c0392b" if v < 0 else "#27ae60" for v in vals]
        ax3.bar(focus, vals, color=colors, alpha=0.75)
        ax3.axvline(0, color="red", linestyle="--", alpha=0.5, linewidth=1.2)
        ax3.axhline(0, color="black", alpha=0.4)
        ax3.set_title("Mean Daily AR (T-14 to T+14)")
        ax3.set_xlabel("Days relative to unlock")
        ax3.set_ylabel("Mean AR (%)")
        ax3.grid(alpha=0.25, axis="y")

    # 4. % negative T0 by segment
    ax4 = fig.add_subplot(gs[1, 1])
    segs = list(results.keys())
    neg_pcts = [results[s]["t0_pct_neg"] * 100 for s in segs]
    colors = ["#c0392b" if p > 50 else "#27ae60" for p in neg_pcts]
    ax4.barh(segs, neg_pcts, color=colors, alpha=0.75)
    ax4.axvline(50, color="black", linestyle="--", alpha=0.5)
    ax4.set_title("% Events with Negative AR on Unlock Day")
    ax4.set_xlabel("% of events")
    ax4.grid(alpha=0.25, axis="x")
    for i, pct in enumerate(neg_pcts):
        ax4.text(pct + 0.5, i, f"{pct:.0f}%", va="center", fontsize=9)

    plt.savefig("unlock_event_study.png", dpi=150, bbox_inches="tight")
    print("Chart saved: unlock_event_study.png")


def save(results: dict, events: list[dict]):
    summary = {}
    for seg, r in results.items():
        cps = {}
        for cp, val_n in r["checkpoints"].items():
            if val_n:
                cps[f"cum_ar_t{cp}_pct"] = round(val_n[0] * 100, 3)
                cps[f"cum_ar_t{cp}_n"]   = val_n[1]
        summary[seg] = {
            "n":              r["n"],
            "t0_ar_pct":      round(r["t0_mean"] * 100, 3),
            "pre_7d_avg_pct": round(r["pre7_mean"] * 100, 3) if r["pre7_mean"] else None,
            "pct_negative_t0": round(r["t0_pct_neg"] * 100, 1),
            **cps,
        }
    with open("results_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    rows = []
    for e in events:
        row = {"token": e["token"], "date": e["date"],
               "unlock_pct": e["unlock_pct"], "size_bucket": e["size_bucket"]}
        for d in EVENT_DAYS:
            row[f"ar_t{d:+d}"] = round(e["ar"].get(d, float("nan")) * 100, 4)
        rows.append(row)
    pd.DataFrame(rows).to_csv("event_level_results.csv", index=False)
    print("Saved: results_summary.json, event_level_results.csv")


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--tokens", nargs="+", default=DEFAULT_TOKENS)
    parser.add_argument("--min-unlock-pct", type=float, default=MIN_UNLOCK_PCT)
    args = parser.parse_args()
    run_backtest(args.tokens, args.min_unlock_pct)
