#!/usr/bin/env python3
"""
Multi-Agent Crypto Investment Memo Pipeline
-------------------------------------------
Architecture:
  1.  Live data fetch   — CoinGecko + DefiLlama (real numbers, no hallucination)
  2.  Research synth    — Claude interprets the data
  3.  Thesis extract    — Claude isolates the key variable
  4.  Draft v1          — Claude writes full institutional memo
  5.  Critique          — GPT-4o adversarial partner review
  6.  Rewrite (v2)      — Claude responds to critique
  7.  Kill step         — GPT-4o writes strongest bear case
  8.  Draft v3          — Claude addresses bear case
  9.  Final polish      — GPT-4o compresses for investment committee
  10. Scorecard         — GPT-4o scores on clarity, rigor, falsifiability, conviction

Requirements:
  pip install anthropic openai requests

Environment vars:
  ANTHROPIC_API_KEY
  OPENAI_API_KEY

Usage:
  python memo_pipeline.py "Virtuals Protocol"
  python memo_pipeline.py "Bittensor"
"""

import os
import sys
import json
import time
import requests
from datetime import datetime
from pathlib import Path
from typing import Optional

import anthropic
from openai import OpenAI

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────

CLAUDE_MODEL  = "claude-opus-4-6"
GPT_MODEL     = "gpt-4o"
MAX_TOKENS    = 8192

OUTPUT_DIR    = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
DEFILLAMA_BASE = "https://api.llama.fi"

claude_client = anthropic.Anthropic()
openai_client = OpenAI()


# ─────────────────────────────────────────────
# Data Layer — CoinGecko
# ─────────────────────────────────────────────

def cg_search(query: str) -> Optional[str]:
    """Resolve a project name to a CoinGecko coin ID."""
    try:
        r = requests.get(f"{COINGECKO_BASE}/search", params={"query": query}, timeout=10)
        r.raise_for_status()
        coins = r.json().get("coins", [])
        if not coins:
            return None
        ranked = [c for c in coins if c.get("market_cap_rank")]
        if ranked:
            return sorted(ranked, key=lambda x: x["market_cap_rank"])[0]["id"]
        return coins[0]["id"]
    except Exception as e:
        print(f"  CoinGecko search error: {e}")
        return None


def fetch_coingecko(coin_id: str) -> dict:
    """Fetch price, market, supply, and 90-day chart data."""
    try:
        r = requests.get(
            f"{COINGECKO_BASE}/coins/{coin_id}",
            params={
                "localization": "false",
                "tickers": "false",
                "market_data": "true",
                "community_data": "false",
                "developer_data": "false",
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        md   = data.get("market_data", {})
        time.sleep(1.5)  # free-tier rate limit

        chart = requests.get(
            f"{COINGECKO_BASE}/coins/{coin_id}/market_chart",
            params={"vs_currency": "usd", "days": "90"},
            timeout=10,
        )
        chart.raise_for_status()
        prices       = [p[1] for p in chart.json().get("prices", [])]
        high_90d     = max(prices) if prices else None
        low_90d      = min(prices) if prices else None

        return {
            "name":               data.get("name"),
            "symbol":             data.get("symbol", "").upper(),
            "price_usd":          md.get("current_price",  {}).get("usd"),
            "market_cap":         md.get("market_cap",     {}).get("usd"),
            "fdv":                md.get("fully_diluted_valuation", {}).get("usd"),
            "volume_24h":         md.get("total_volume",   {}).get("usd"),
            "circulating_supply": md.get("circulating_supply"),
            "total_supply":       md.get("total_supply"),
            "max_supply":         md.get("max_supply"),
            "ath":                md.get("ath",  {}).get("usd"),
            "ath_date":           md.get("ath_date", {}).get("usd", "")[:10],
            "ath_drawdown_pct":   md.get("ath_change_percentage", {}).get("usd"),
            "price_change_7d":    md.get("price_change_percentage_7d_in_currency",  {}).get("usd"),
            "price_change_30d":   md.get("price_change_percentage_30d_in_currency", {}).get("usd"),
            "price_90d_high":     high_90d,
            "price_90d_low":      low_90d,
            "description":        data.get("description", {}).get("en", "")[:600],
            "categories":         data.get("categories", []),
        }
    except Exception as e:
        print(f"  CoinGecko fetch error: {e}")
        return {}


# ─────────────────────────────────────────────
# Data Layer — DefiLlama
# ─────────────────────────────────────────────

def dl_search(query: str) -> Optional[str]:
    """Resolve a project name to a DefiLlama protocol slug."""
    try:
        r = requests.get(f"{DEFILLAMA_BASE}/protocols", timeout=15)
        r.raise_for_status()
        protocols   = r.json()
        q           = query.lower().replace(" ", "").replace("-", "")

        for p in protocols:
            if p.get("name", "").lower().replace(" ", "").replace("-", "") == q:
                return p["slug"]

        for p in protocols:
            name = p.get("name", "").lower().replace(" ", "").replace("-", "")
            if q[:6] in name:
                return p["slug"]

        return None
    except Exception as e:
        print(f"  DefiLlama search error: {e}")
        return None


def fetch_defillama(slug: str) -> dict:
    """Fetch TVL history, fees, and revenue from DefiLlama."""
    result = {}

    try:
        r = requests.get(f"{DEFILLAMA_BASE}/protocol/{slug}", timeout=10)
        if r.ok:
            data     = r.json()
            tvl_data = data.get("tvl", [])
            current  = tvl_data[-1]["totalLiquidityUSD"]  if tvl_data          else None
            ago_30d  = tvl_data[-30]["totalLiquidityUSD"] if len(tvl_data)>=30 else None
            ago_90d  = tvl_data[-90]["totalLiquidityUSD"] if len(tvl_data)>=90 else None
            tvl_ath  = max((t["totalLiquidityUSD"] for t in tvl_data), default=None)
            result.update({
                "tvl_current": current,
                "tvl_30d_ago": ago_30d,
                "tvl_90d_ago": ago_90d,
                "tvl_ath":     tvl_ath,
                "chains":      data.get("chains", []),
                "category":    data.get("category"),
            })
    except Exception as e:
        print(f"  DefiLlama TVL error: {e}")

    time.sleep(0.5)

    for metric in ["dailyFees", "dailyRevenue"]:
        try:
            r = requests.get(
                f"{DEFILLAMA_BASE}/summary/fees/{slug}",
                params={"dataType": metric},
                timeout=10,
            )
            if r.ok:
                total  = r.json().get("totalDataChart", [])
                recent = [t[1] for t in total[-30:] if t[1]] if total else []
                key    = "fees" if "Fees" in metric else "revenue"
                avg    = sum(recent) / len(recent) if recent else None
                peak   = max((t[1] for t in total if t[1]), default=None) if total else None
                result[f"{key}_avg_daily_30d"]        = avg
                result[f"{key}_monthly_run_rate"]     = avg * 30 if avg else None
                result[f"{key}_all_time_peak_daily"]  = peak
            time.sleep(0.5)
        except Exception as e:
            print(f"  DefiLlama {metric} error: {e}")

    return result


def fetch_all(project: str) -> dict:
    """Master fetch — returns combined CoinGecko + DefiLlama data dict."""
    print("  → CoinGecko...")
    cg_id   = cg_search(project)
    cg_data = fetch_coingecko(cg_id) if cg_id else {}
    print(f"    {'✓ ' + cg_id if cg_id else '✗ not found'}")

    print("  → DefiLlama...")
    dl_slug = dl_search(project)
    dl_data = fetch_defillama(dl_slug) if dl_slug else {}
    print(f"    {'✓ ' + dl_slug if dl_slug else '✗ not found (may not be a DeFi protocol)'}")

    return {
        "project":    project,
        "fetched_at": datetime.utcnow().isoformat() + "Z",
        "coingecko":  cg_data,
        "defillama":  dl_data,
    }


# ─────────────────────────────────────────────
# Formatting
# ─────────────────────────────────────────────

def fmt(val, kind="usd") -> str:
    if val is None:
        return "UNKNOWN"
    if kind == "usd":
        if   val >= 1e9: return f"${val/1e9:.2f}B"
        elif val >= 1e6: return f"${val/1e6:.1f}M"
        elif val >= 1e3: return f"${val/1e3:.1f}K"
        else:            return f"${val:.4f}"
    if kind == "pct":
        return f"{val:+.1f}%"
    if kind == "num":
        if   val >= 1e9: return f"{val/1e9:.2f}B"
        elif val >= 1e6: return f"{val/1e6:.1f}M"
        else:            return f"{val:,.0f}"
    return str(val)


def data_to_markdown(data: dict) -> str:
    """Render fetched data as clean markdown for prompts."""
    cg = data.get("coingecko", {})
    dl = data.get("defillama", {})
    project = data.get("project", "Unknown")

    # ── implied multiples ──────────────────────────────────────
    fdv     = cg.get("fdv")
    mcap    = cg.get("market_cap")
    rev_mo  = dl.get("revenue_monthly_run_rate")
    rev_ann = rev_mo * 12 if rev_mo else None
    ps_fdv  = round(fdv  / rev_ann, 1) if fdv  and rev_ann else None
    ps_mc   = round(mcap / rev_ann, 1) if mcap and rev_ann else None

    lines = [
        f"# Live Market Data — {project}",
        f"*Fetched: {data.get('fetched_at', 'unknown')} (UTC)*\n",
        "## Price & Valuation",
        f"- Price:              {fmt(cg.get('price_usd'))}",
        f"- Market Cap:         {fmt(mcap)}",
        f"- FDV:                {fmt(fdv)}",
        f"- 24h Volume:         {fmt(cg.get('volume_24h'))}",
        f"- ATH:                {fmt(cg.get('ath'))} ({cg.get('ath_date', 'unknown')})",
        f"- Drawdown from ATH:  {fmt(cg.get('ath_drawdown_pct'), 'pct')}",
        f"- 7d Change:          {fmt(cg.get('price_change_7d'),  'pct')}",
        f"- 30d Change:         {fmt(cg.get('price_change_30d'), 'pct')}",
        f"- 90d High:           {fmt(cg.get('price_90d_high'))}",
        f"- 90d Low:            {fmt(cg.get('price_90d_low'))}",
        "",
        "## Token Supply",
        f"- Circulating:        {fmt(cg.get('circulating_supply'), 'num')}",
        f"- Total:              {fmt(cg.get('total_supply'),       'num')}",
        f"- Max:                {fmt(cg.get('max_supply'),         'num')}",
    ]

    if dl:
        lines += [
            "",
            "## Protocol Metrics (DefiLlama)",
            f"- TVL (current):      {fmt(dl.get('tvl_current'))}",
            f"- TVL (30d ago):      {fmt(dl.get('tvl_30d_ago'))}",
            f"- TVL (90d ago):      {fmt(dl.get('tvl_90d_ago'))}",
            f"- TVL ATH:            {fmt(dl.get('tvl_ath'))}",
            f"- Category:           {dl.get('category', 'UNKNOWN')}",
            f"- Chains:             {', '.join(dl.get('chains', [])) or 'UNKNOWN'}",
        ]

    if dl.get("revenue_monthly_run_rate") or dl.get("fees_monthly_run_rate"):
        lines += [
            "",
            "## Revenue & Fees",
            f"- Avg Daily Revenue (30d):    {fmt(dl.get('revenue_avg_daily_30d'))}",
            f"- Monthly Revenue Run Rate:   {fmt(dl.get('revenue_monthly_run_rate'))}",
            f"- Annualised Revenue:         {fmt(rev_ann)}",
            f"- Revenue ATH (daily):        {fmt(dl.get('revenue_all_time_peak_daily'))}",
            f"- Avg Daily Fees (30d):       {fmt(dl.get('fees_avg_daily_30d'))}",
            f"- Monthly Fees Run Rate:      {fmt(dl.get('fees_monthly_run_rate'))}",
        ]

    if ps_fdv or ps_mc:
        lines += [
            "",
            "## Implied Multiples (calculated)",
            f"- FDV / Annualised Revenue:   {ps_fdv}x" if ps_fdv else "- FDV / Annualised Revenue:   UNKNOWN",
            f"- MCap / Annualised Revenue:  {ps_mc}x"  if ps_mc  else "- MCap / Annualised Revenue:  UNKNOWN",
        ]

    if cg.get("description"):
        lines += ["", f"## Description\n{cg['description']}"]

    if cg.get("categories"):
        lines += ["", f"## Categories\n{', '.join(cg['categories'])}"]

    return "\n".join(lines)


# ─────────────────────────────────────────────
# LLM Runners
# ─────────────────────────────────────────────

def run_claude(prompt: str, system: str = "", max_tokens: int = MAX_TOKENS) -> str:
    kwargs = {
        "model":      CLAUDE_MODEL,
        "max_tokens": max_tokens,
        "messages":   [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system
    try:
        resp = claude_client.messages.create(**kwargs)
        return resp.content[0].text.strip()
    except anthropic.APIError as e:
        print(f"  Claude error: {e}")
        raise


def run_gpt(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    try:
        resp = openai_client.chat.completions.create(
            model=GPT_MODEL,
            messages=messages,
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"  GPT error: {e}")
        raise


def save(name: str, content: str, run_dir: Path) -> None:
    path = run_dir / f"{name}.md"
    path.write_text(content, encoding="utf-8")
    print(f"  ✓ {path.name}")


# ─────────────────────────────────────────────
# System Prompts
# ─────────────────────────────────────────────

SYSTEM_RESEARCH = """\
You are a senior crypto research analyst at an institutional fund.
You write in the style of Spartan Group research: precise, data-driven, no filler.
You work ONLY with data explicitly provided. You never estimate or hallucinate.
If something is unknown, you write UNKNOWN and flag it as a data gap.\
"""

SYSTEM_MEMO = """\
You are writing institutional investment research in the style of Spartan Group.
Standards: explicit numbers, clear mechanism, falsifiable thesis, no vague claims.
Every assertion requires evidence from the provided data.
If data is missing, say so explicitly rather than papering over it.\
"""

SYSTEM_CRITIC = """\
You are a partner at a top-tier crypto fund reviewing a junior analyst's memo.
You are known for catching weak arguments, missing data, and unsupported claims.
You do not rewrite. You critique only. Be specific and ruthless.\
"""

SYSTEM_BEAR = """\
You are a short-seller who just read this investment memo.
Your job is to destroy the thesis.
Find every assumption, every data gap, every logical flaw.
Write the strongest possible structural bear case.\
"""


# ─────────────────────────────────────────────
# Prompt Builders
# ─────────────────────────────────────────────

def p_research(project: str, data_md: str) -> str:
    return f"""\
Using ONLY the live data below, write a comprehensive research document on {project}.

Your tasks:
1. Interpret what the numbers mean — do not just restate them
2. Calculate and call out any anomalies (ATH drawdown, TVL trend direction, revenue vs FDV gap)
3. The implied multiples are pre-calculated — use them as your valuation anchor
4. Identify what category of asset this is and what the correct valuation framework is
5. Flag every unknown or missing data point explicitly with [DATA GAP]
6. Write 2–3 sentences on competitive positioning based on category/description

Do not add any information not present in the data below.

{data_md}"""


def p_thesis(research: str) -> str:
    return f"""\
Based ONLY on the research below, extract the investment thesis.

Answer these questions precisely, with numbers where available:
1. What single variable most drives valuation upside or downside?
2. What is the market currently pricing in?
3. What must be true for this asset to be mispriced upward?
4. What must be true for this asset to be mispriced downward?
5. What is the key unknown that would change the answer?
6. What is the correct valuation framework for this asset type?

No vague statements. Use numbers from the research.

Research:
{research}"""


def p_draft(project: str, research: str, thesis: str) -> str:
    return f"""\
Write an institutional investment memo on {project}.

Rules:
- Use ONLY the data and thesis provided
- Do not introduce new facts
- Where data is missing, state it explicitly and note the impact on conviction
- Every number must come from the research section

Required sections:

## Executive Summary
One paragraph. Single investment question. Clear answer. Verdict on sizing.

## Current State
What the protocol is, what it does, where it stands today. Numbers only.

## What Changed
What has happened in the last 30–90 days that makes this worth analysing now.

## Mechanism
How value accrues to the token. Specific about the fee/revenue/emission model.

## Financials
Every available number. Revenue, fees, TVL, volume, all multiples.

## Valuation Framework
Correct framework for this asset type. What does current price imply? Is that cheap or expensive?

## Risks
Top 4 risks with specific impact on the thesis. No generic "regulatory risk" without specifics.

## Invalidation Criteria
Specific, measurable data points that would make this thesis wrong.
These must be testable within 90 days.

## Why Now
What creates the setup today vs 3 months ago or 3 months from now.

## Positioning
Sizing framework, entry approach, what to monitor post-entry.

Research:
{research}

Thesis:
{thesis}"""


def p_critique(draft: str) -> str:
    return f"""\
Critique this investment memo. Do NOT rewrite anything.

For each weakness, cite the specific section and quote the specific claim.

Focus on:
- Claims not supported by the data provided
- Valuation logic that doesn't hold under scrutiny
- Missing data that should have been flagged but wasn't
- Circular reasoning or tautologies
- Vague or unmeasurable invalidation criteria
- Sections that hedge without taking a position
- Any numbers that appear inconsistent with each other

Memo:
{draft}"""


def p_rewrite(draft: str, critique: str) -> str:
    return f"""\
Rewrite this investment memo to address the critique below.

Rules:
- Where the critique is correct, fix the underlying argument — not just the wording
- Where the critique is wrong, briefly note why and keep the original position
- If data was missing and the critique flags it, acknowledge the gap explicitly
- Do not add new facts not present in the original draft
- The result should be tighter, not longer

Original Draft:
{draft}

Critique:
{critique}"""


def p_kill(draft: str) -> str:
    return f"""\
You are short this asset. Write the strongest possible bear case.

Requirements:
- Attack the single most load-bearing assumption in the bull thesis
- Use the data from the memo against it wherever possible
- Identify the scenario where this goes to zero or near-zero
- Identify the nearest-term catalyst that would validate the bear case
- Be specific. No vague macro risks. Only structural arguments.

Memo:
{draft}"""


def p_bear_response(draft: str, bear_case: str) -> str:
    return f"""\
Revise this investment memo to directly address the bear case below.

For each bear argument:
- If valid and it changes the thesis → update the thesis
- If valid but doesn't change the thesis → add explicit acknowledgment and counterargument
- If invalid → briefly note why

The output should be a memo a reader who has seen both the bull and bear case would find credible.
Do not add new data. Do not pad.

Draft:
{draft}

Bear Case:
{bear_case}"""


def p_polish(draft: str) -> str:
    return f"""\
Final polish for investment committee presentation.

Instructions:
- Remove hedging that is not substantive
- Compress verbose sections without losing specific numbers
- Ensure every section has a clear, single point
- The Executive Summary must be fully standalone
- Numbers must be consistent throughout
- End with a clear, unambiguous positioning recommendation

Do NOT change the thesis or introduce new information.

Output the final memo only.

Draft:
{draft}"""


def p_score(final: str) -> str:
    return f"""\
Score this investment memo on each dimension below.
For each score, give a one-sentence justification and one specific improvement.

Dimensions (score 1–10):
1. Clarity         — Is the core argument immediately clear?
2. Data Rigor      — Are all claims backed by specific numbers?
3. Falsifiability  — Are invalidation criteria specific and testable within 90 days?
4. Conviction      — Does it take a clear position or hedge everywhere?
5. Completeness    — Are critical unknowns identified and addressed?

Format as a markdown table: Dimension | Score | Justification | Improvement

Then give:
- Overall score (average)
- Single most important improvement

Memo:
{final}"""


# ─────────────────────────────────────────────
# Pipeline
# ─────────────────────────────────────────────

def run_pipeline(project: str) -> str:
    run_id  = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = OUTPUT_DIR / f"{run_id}_{project.replace(' ', '_')}"
    run_dir.mkdir(exist_ok=True)

    sep = "─" * 56
    print(f"\n{sep}")
    print(f"  MEMO PIPELINE  /  {project}")
    print(f"  {run_id}  →  {run_dir}")
    print(f"{sep}\n")

    # ── 1. Live data ─────────────────────────────────────────────
    print("[1/9] Fetching live data...")
    raw   = fetch_all(project)
    md    = data_to_markdown(raw)
    save("01_data_raw",        json.dumps(raw, indent=2), run_dir)
    save("02_data_structured", md,                        run_dir)

    # ── 2. Research synthesis ────────────────────────────────────
    print("[2/9] Research synthesis (Claude)...")
    research = run_claude(p_research(project, md), system=SYSTEM_RESEARCH)
    save("03_research", research, run_dir)

    # ── 3. Thesis extraction ─────────────────────────────────────
    print("[3/9] Thesis extraction (Claude)...")
    thesis = run_claude(p_thesis(research), system=SYSTEM_RESEARCH)
    save("04_thesis", thesis, run_dir)

    # ── 4. Draft v1 ──────────────────────────────────────────────
    print("[4/9] Draft v1 (Claude)...")
    draft_v1 = run_claude(p_draft(project, research, thesis), system=SYSTEM_MEMO)
    save("05_draft_v1", draft_v1, run_dir)

    # ── 5. GPT critique ──────────────────────────────────────────
    print("[5/9] Adversarial critique (GPT)...")
    critique = run_gpt(p_critique(draft_v1), system=SYSTEM_CRITIC)
    save("06_critique", critique, run_dir)

    # ── 6. Claude rewrite ────────────────────────────────────────
    print("[6/9] Rewrite — addressing critique (Claude)...")
    draft_v2 = run_claude(p_rewrite(draft_v1, critique), system=SYSTEM_MEMO)
    save("07_draft_v2", draft_v2, run_dir)

    # ── 7. GPT kill step ─────────────────────────────────────────
    print("[7/9] Bear case / kill step (GPT)...")
    bear = run_gpt(p_kill(draft_v2), system=SYSTEM_BEAR)
    save("08_bear_case", bear, run_dir)

    # ── 8. Claude final ──────────────────────────────────────────
    print("[8/9] Final draft — addressing bear case (Claude)...")
    draft_v3 = run_claude(p_bear_response(draft_v2, bear), system=SYSTEM_MEMO)
    save("09_draft_v3", draft_v3, run_dir)

    # ── 9. GPT polish + score ────────────────────────────────────
    print("[9/9] Polish + scorecard (GPT)...")
    final = run_gpt(
        p_polish(draft_v3),
        system="You are a senior editor at an institutional research firm. Output the polished memo only.",
    )
    save("10_final_memo", final, run_dir)

    score = run_gpt(p_score(final))
    save("11_scorecard", score, run_dir)

    # ── Summary ──────────────────────────────────────────────────
    print(f"\n{sep}")
    print(f"  COMPLETE  →  {run_dir}")
    print(f"{sep}\n")

    print("Output files:")
    for f in sorted(run_dir.iterdir()):
        print(f"  {f.name}")

    print(f"\n── SCORECARD {'─'*38}\n")
    print(score)

    print(f"\n── EXECUTIVE SUMMARY {'─'*32}\n")
    in_summary = False
    for line in final.split("\n"):
        if "Executive Summary" in line:
            in_summary = True
        elif line.startswith("## ") and in_summary:
            break
        if in_summary:
            print(line)

    return final


# ─────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:   python memo_pipeline.py 'Project Name'")
        print("Example: python memo_pipeline.py 'Virtuals Protocol'")
        sys.exit(1)

    run_pipeline(" ".join(sys.argv[1:]))
