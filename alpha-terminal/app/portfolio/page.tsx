"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import Panel from "@/components/Panel";
import StatCard from "@/components/StatCard";
import { weightedPortfolio, normaliseSeries, maxDrawdown, correlationMatrix } from "@/lib/backtest";

interface Position {
  ticker: string;
  units: number;
  type: string;
  label: string;
  entryPrice: number | null;
  watchlist?: boolean;
}

interface PortfolioData {
  unitValue: number;
  positions: Position[];
  cash: { gbp: number; usd: number };
  crashPlaybook: string;
}

type PriceMap = Record<string, { price: number; change1d: number; changePercent1d: number }>;
type HistMap = Record<string, { date: string; close: number }[]>;

const RANGES = ["6m", "1y", "3y"] as const;

function corrColor(v: number): string {
  if (v >= 0.7) return "bg-red-900/60 text-red-300";
  if (v >= 0.4) return "bg-orange-900/40 text-orange-300";
  if (v >= 0) return "bg-zinc-800 text-zinc-300";
  return "bg-blue-900/40 text-blue-300";
}

function driftColor(drift: number): string {
  const abs = Math.abs(drift);
  if (abs >= 5) return "text-red-400";
  if (abs >= 3) return "text-amber-400";
  return "text-zinc-400";
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [prices, setPrices] = useState<PriceMap>({});
  const [hist, setHist] = useState<HistMap>({});
  const [range, setRange] = useState<"6m" | "1y" | "3y">("1y");
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<PortfolioData | null>(null);
  const [saving, setSaving] = useState(false);

  // Load portfolio config
  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => setPortfolio(d))
      .catch(() => {});
  }, [saving]); // Reload after save

  // Load live prices
  const fetchPrices = useCallback(() => {
    if (!portfolio) return;
    const tickers = portfolio.positions.map((p) => p.ticker).join(",");
    fetch(`/api/prices?tickers=${encodeURIComponent(tickers)}&_=${refreshKey}`)
      .then((r) => r.json())
      .then((data) => { setPrices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [portfolio, refreshKey]);

  useEffect(() => {
    if (portfolio) {
      setLoading(true);
      fetchPrices();
    }
  }, [portfolio, refreshKey]);

  // Load historical data
  useEffect(() => {
    if (!portfolio) return;
    setHistLoading(true);
    const tickers = [...portfolio.positions.filter((p) => p.units > 0).map((p) => p.ticker), "^GSPC", "QQQ"].join(",");
    fetch(`/api/history?tickers=${encodeURIComponent(tickers)}&range=${range}`)
      .then((r) => r.json())
      .then((data) => { setHist(data); setHistLoading(false); })
      .catch(() => setHistLoading(false));
  }, [portfolio, range]);

  const activePosns = useMemo(
    () => (portfolio?.positions ?? []).filter((p) => !p.watchlist || p.units > 0),
    [portfolio]
  );
  const totalUnits = useMemo(
    () => activePosns.reduce((s, p) => s + p.units, 0),
    [activePosns]
  );
  const unitValue = portfolio?.unitValue ?? 1000;

  // Compute live stats
  const posStats = useMemo(() => {
    return activePosns.map((p) => {
      const q = prices[p.ticker];
      const targetWeight = totalUnits > 0 ? p.units / totalUnits : 0;
      const value = q ? q.price * p.units * (unitValue / 100) : null;
      const unrealisedPnl =
        q && p.entryPrice !== null
          ? (q.price - p.entryPrice) * p.units * (unitValue / 100)
          : null;
      const unrealisedPct =
        q && p.entryPrice !== null && p.entryPrice > 0
          ? ((q.price - p.entryPrice) / p.entryPrice) * 100
          : null;
      return { ...p, price: q?.price ?? null, change1d: q?.changePercent1d ?? null, value, targetWeight, unrealisedPnl, unrealisedPct };
    });
  }, [prices, activePosns, totalUnits, unitValue]);

  const totalValue = posStats.reduce((s, p) => s + (p.value ?? 0), 0);
  const totalUnrealisedPnl = posStats.reduce((s, p) => s + (p.unrealisedPnl ?? 0), 0);
  const costBasis = posStats.reduce((s, p) => {
    if (p.entryPrice !== null && p.units > 0) {
      return s + p.entryPrice * p.units * (unitValue / 100);
    }
    return s;
  }, 0);
  const cashValue = ((portfolio?.cash.gbp ?? 0) + (portfolio?.cash.usd ?? 0)) * unitValue;
  const grandTotal = totalValue + cashValue;
  const dailyPnL = posStats.reduce((s, p) => {
    if (p.price && p.change1d !== null && p.value) return s + (p.value * p.change1d) / 100;
    return s;
  }, 0);
  const biggestMover = posStats
    .filter((p) => p.change1d !== null)
    .sort((a, b) => Math.abs(b.change1d!) - Math.abs(a.change1d!))[0];

  // Rebalancing calculator
  const rebalanceData = useMemo(() => {
    if (!totalValue) return [];
    return posStats
      .filter((p) => p.price !== null && p.value !== null)
      .map((p) => {
        const actualWeight = p.value! / totalValue;
        const drift = (actualWeight - p.targetWeight) * 100;
        // Units to buy/sell to reach target weight at current prices
        const targetValue = p.targetWeight * totalValue;
        const currentValue = p.value!;
        const deltaValue = targetValue - currentValue;
        const unitsNeeded = p.price ? deltaValue / (p.price * (unitValue / 100)) : 0;
        return {
          label: p.label,
          ticker: p.ticker,
          targetPct: +(p.targetWeight * 100).toFixed(1),
          actualPct: +(actualWeight * 100).toFixed(1),
          drift: +drift.toFixed(1),
          unitsNeeded: +unitsNeeded.toFixed(2),
        };
      })
      .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
  }, [posStats, totalValue, unitValue]);

  // Backtest chart data
  const chartData = useMemo(() => {
    if (!Object.keys(hist).length) return [];
    const weights: Record<string, number> = {};
    for (const p of activePosns) if (p.units > 0) weights[p.ticker] = p.units / totalUnits;
    const portSeries = weightedPortfolio(hist, weights);
    const spxNorm = normaliseSeries(hist["^GSPC"] ?? []);
    const qqqNorm = normaliseSeries(hist["QQQ"] ?? []);
    const spxMap: Record<string, number> = {};
    const qqqMap: Record<string, number> = {};
    spxNorm.forEach((d) => (spxMap[d.date] = d.value));
    qqqNorm.forEach((d) => (qqqMap[d.date] = d.value));
    return portSeries.map((d) => ({
      date: d.date.slice(5),
      Portfolio: +(d.value * 100 - 100).toFixed(2),
      SPX: spxMap[d.date] !== undefined ? +(spxMap[d.date] * 100 - 100).toFixed(2) : undefined,
      QQQ: qqqMap[d.date] !== undefined ? +(qqqMap[d.date] * 100 - 100).toFixed(2) : undefined,
    }));
  }, [hist, activePosns, totalUnits]);

  const drawdowns = useMemo(() => {
    return activePosns.map((p) => {
      const s = hist[p.ticker] ?? [];
      const dd = maxDrawdown(normaliseSeries(s));
      return { ticker: p.ticker, label: p.label, dd: +(dd * 100).toFixed(1) };
    }).sort((a, b) => b.dd - a.dd);
  }, [hist, activePosns]);

  const corrData = useMemo(() => {
    const filtered: Record<string, { date: string; close: number }[]> = {};
    for (const p of activePosns) {
      if (hist[p.ticker]?.length) filtered[p.ticker] = hist[p.ticker];
    }
    if (Object.keys(filtered).length < 2) return null;
    return correlationMatrix(filtered);
  }, [hist, activePosns]);

  // Edit mode
  const openEdit = () => {
    if (!portfolio) return;
    setEditDraft(JSON.parse(JSON.stringify(portfolio)));
    setEditMode(true);
  };
  const closeEdit = () => { setEditMode(false); setEditDraft(null); };
  const saveEdit = async () => {
    if (!editDraft) return;
    setSaving(true);
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", portfolio: editDraft }),
    });
    setSaving(false);
    setEditMode(false);
    setEditDraft(null);
  };

  const updateDraftPos = (i: number, field: keyof Position, value: string | number | boolean | null) => {
    if (!editDraft) return;
    const next = { ...editDraft, positions: [...editDraft.positions] };
    next.positions[i] = { ...next.positions[i], [field]: value };
    setEditDraft(next);
  };
  const addDraftPos = () => {
    if (!editDraft) return;
    setEditDraft({
      ...editDraft,
      positions: [...editDraft.positions, { ticker: "", units: 0, type: "etf", label: "", entryPrice: null }],
    });
  };
  const removeDraftPos = (i: number) => {
    if (!editDraft) return;
    const next = { ...editDraft, positions: editDraft.positions.filter((_, idx) => idx !== i) };
    setEditDraft(next);
  };

  if (!portfolio) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-zinc-500 font-mono text-sm">Loading portfolio…</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Portfolio</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Live tracker · Backtester · Rebalancer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-mono rounded transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={openEdit}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-mono rounded transition-colors"
          >
            Edit Portfolio
          </button>
        </div>
      </div>

      {/* Edit Mode Overlay */}
      {editMode && editDraft && (
        <Panel title="Edit Portfolio">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 block mb-1">Unit Value ($)</label>
                <input
                  type="number"
                  value={editDraft.unitValue}
                  onChange={(e) => setEditDraft({ ...editDraft, unitValue: +e.target.value })}
                  className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <label className="text-xs font-mono text-zinc-500 block mb-1">Cash GBP (units)</label>
                <input type="number" value={editDraft.cash.gbp}
                  onChange={(e) => setEditDraft({ ...editDraft, cash: { ...editDraft.cash, gbp: +e.target.value } })}
                  className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
                <label className="text-xs font-mono text-zinc-500 block mb-1 ml-2">USD (units)</label>
                <input type="number" value={editDraft.cash.usd}
                  onChange={(e) => setEditDraft({ ...editDraft, cash: { ...editDraft.cash, usd: +e.target.value } })}
                  className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 pr-3">Label</th>
                    <th className="text-left pr-3">Ticker</th>
                    <th className="text-left pr-3">Type</th>
                    <th className="text-right pr-3">Units</th>
                    <th className="text-right pr-3">Entry Price</th>
                    <th className="text-center pr-3">Watchlist</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {editDraft.positions.map((p, i) => (
                    <tr key={i} className="border-b border-zinc-800/40">
                      <td className="py-1.5 pr-3">
                        <input value={p.label} onChange={(e) => updateDraftPos(i, "label", e.target.value)}
                          className="w-28 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500" />
                      </td>
                      <td className="pr-3">
                        <input value={p.ticker} onChange={(e) => updateDraftPos(i, "ticker", e.target.value.toUpperCase())}
                          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 uppercase" />
                      </td>
                      <td className="pr-3">
                        <select value={p.type} onChange={(e) => updateDraftPos(i, "type", e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none">
                          <option value="etf">ETF</option>
                          <option value="stock">Stock</option>
                          <option value="crypto">Crypto</option>
                        </select>
                      </td>
                      <td className="pr-3 text-right">
                        <input type="number" value={p.units} onChange={(e) => updateDraftPos(i, "units", +e.target.value)}
                          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none text-right" />
                      </td>
                      <td className="pr-3 text-right">
                        <input type="number" step="0.01"
                          value={p.entryPrice ?? ""}
                          placeholder="—"
                          onChange={(e) => updateDraftPos(i, "entryPrice", e.target.value ? +e.target.value : null)}
                          className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none text-right" />
                      </td>
                      <td className="pr-3 text-center">
                        <input type="checkbox" checked={!!p.watchlist}
                          onChange={(e) => updateDraftPos(i, "watchlist", e.target.checked)}
                          className="accent-blue-500" />
                      </td>
                      <td>
                        <button onClick={() => removeDraftPos(i)} className="text-red-600 hover:text-red-400 text-xs font-mono">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={addDraftPos}
                className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-xs font-mono rounded hover:bg-zinc-600">
                + Add Position
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded disabled:opacity-40">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={closeEdit}
                className="px-4 py-1.5 bg-zinc-700 text-zinc-300 text-xs font-mono rounded hover:bg-zinc-600">
                Cancel
              </button>
            </div>
          </div>
        </Panel>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Equity Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard
          label="Daily P&L"
          value={`${dailyPnL >= 0 ? "+" : ""}$${Math.abs(dailyPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          delta={dailyPnL >= 0 ? "positive today" : "negative today"}
          deltaPositive={dailyPnL >= 0}
        />
        <StatCard
          label="Unrealised P&L"
          value={costBasis > 0 ? `${totalUnrealisedPnl >= 0 ? "+" : ""}$${Math.abs(totalUnrealisedPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "Set entry prices"}
          delta={costBasis > 0 ? `${((totalUnrealisedPnl / costBasis) * 100).toFixed(1)}% vs cost` : undefined}
          deltaPositive={totalUnrealisedPnl >= 0}
          sub={costBasis > 0 ? `Cost basis: $${costBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : undefined}
        />
        <StatCard
          label="Biggest Mover"
          value={biggestMover?.ticker ?? "—"}
          delta={biggestMover ? `${biggestMover.change1d! >= 0 ? "+" : ""}${biggestMover.change1d!.toFixed(2)}%` : undefined}
          deltaPositive={(biggestMover?.change1d ?? 0) >= 0}
        />
      </div>

      {/* Live tracker table */}
      <Panel title="Positions">
        {loading ? (
          <p className="text-zinc-500 text-sm font-mono">Fetching prices…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 pr-3">Label</th>
                  <th className="text-left pr-3">Ticker</th>
                  <th className="text-right pr-3">Units</th>
                  <th className="text-right pr-3">Tgt%</th>
                  <th className="text-right pr-3">Price</th>
                  <th className="text-right pr-3">Entry</th>
                  <th className="text-right pr-3">1d Δ%</th>
                  <th className="text-right pr-3">Unreal P&L</th>
                  <th className="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {posStats.map((p) => (
                  <tr key={p.ticker} className={`border-b border-zinc-800/40 ${p.watchlist ? "opacity-50" : ""}`}>
                    <td className="py-2 pr-3 text-zinc-300">{p.label}{p.watchlist ? " *" : ""}</td>
                    <td className="pr-3 text-zinc-400">{p.ticker}</td>
                    <td className="pr-3 text-right">{p.units}</td>
                    <td className="pr-3 text-right text-zinc-500">{(p.targetWeight * 100).toFixed(1)}%</td>
                    <td className="pr-3 text-right">
                      {p.price !== null ? `$${p.price < 1000 ? p.price.toFixed(2) : p.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td className="pr-3 text-right text-zinc-500">
                      {p.entryPrice !== null ? `$${p.entryPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className={`pr-3 text-right ${p.change1d !== null ? (p.change1d >= 0 ? "text-green-400" : "text-red-400") : "text-zinc-600"}`}>
                      {p.change1d !== null ? `${p.change1d >= 0 ? "+" : ""}${p.change1d.toFixed(2)}%` : "—"}
                    </td>
                    <td className={`pr-3 text-right text-xs ${p.unrealisedPnl !== null ? (p.unrealisedPnl >= 0 ? "text-green-400" : "text-red-400") : "text-zinc-700"}`}>
                      {p.unrealisedPnl !== null
                        ? `${p.unrealisedPnl >= 0 ? "+" : ""}$${Math.abs(p.unrealisedPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })} (${p.unrealisedPct! >= 0 ? "+" : ""}${p.unrealisedPct!.toFixed(1)}%)`
                        : "—"}
                    </td>
                    <td className="text-right">
                      {p.value !== null ? `$${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-zinc-800/40 text-zinc-500">
                  <td className="py-2 pr-3">Cash (GBP)</td>
                  <td className="pr-3">—</td>
                  <td className="pr-3 text-right">{portfolio.cash.gbp}</td>
                  <td colSpan={5} />
                  <td className="text-right">${(portfolio.cash.gbp * unitValue).toLocaleString()}</td>
                </tr>
                <tr className="text-zinc-500">
                  <td className="py-2 pr-3">Cash (USD)</td>
                  <td className="pr-3">—</td>
                  <td className="pr-3 text-right">{portfolio.cash.usd}</td>
                  <td colSpan={5} />
                  <td className="text-right">${(portfolio.cash.usd * unitValue).toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700 text-zinc-200 font-semibold">
                  <td colSpan={8} className="py-2">Grand Total (equity + cash)</td>
                  <td className="text-right">${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              </tfoot>
            </table>
            <p className="text-zinc-600 text-xs mt-2">* watchlist · Entry prices editable via Edit Portfolio</p>
          </div>
        )}
      </Panel>

      {/* Rebalancing Calculator */}
      {rebalanceData.length > 0 && (
        <Panel title="Rebalancing Calculator">
          <p className="text-xs text-zinc-500 font-mono mb-3">
            Drift = actual weight minus target weight. Amber ≥ 3pp drift · Red ≥ 5pp drift.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 pr-4">Label</th>
                  <th className="text-right pr-4">Target %</th>
                  <th className="text-right pr-4">Actual %</th>
                  <th className="text-right pr-4">Drift</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rebalanceData.map((r) => (
                  <tr key={r.ticker} className="border-b border-zinc-800/40">
                    <td className="py-2 pr-4 text-zinc-300">{r.label} <span className="text-zinc-600">({r.ticker})</span></td>
                    <td className="pr-4 text-right text-zinc-400">{r.targetPct}%</td>
                    <td className="pr-4 text-right text-zinc-300">{r.actualPct}%</td>
                    <td className={`pr-4 text-right ${driftColor(r.drift)}`}>
                      {r.drift >= 0 ? "+" : ""}{r.drift}pp
                    </td>
                    <td className={`text-right text-xs ${r.unitsNeeded >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {r.unitsNeeded > 0.01 ? `Buy ${r.unitsNeeded.toFixed(2)} units`
                        : r.unitsNeeded < -0.01 ? `Sell ${Math.abs(r.unitsNeeded).toFixed(2)} units`
                        : "Balanced"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Backtester */}
      <Panel title="Backtester">
        <div className="flex gap-2 mb-4">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${range === r ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
              {r}
            </button>
          ))}
        </div>
        {histLoading ? (
          <p className="text-zinc-500 text-sm font-mono">Loading historical data…</p>
        ) : chartData.length === 0 ? (
          <p className="text-zinc-500 text-sm font-mono">No data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} interval={Math.floor(chartData.length / 8)} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} width={50} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => { const n = typeof v === "number" ? v : 0; return [`${n >= 0 ? "+" : ""}${n.toFixed(2)}%`, name]; }} />
              <Line type="monotone" dataKey="Portfolio" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="SPX" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="QQQ" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-2 text-xs font-mono text-zinc-500">
          <span><span className="text-blue-400">—</span> Portfolio</span>
          <span><span className="text-green-400">- -</span> SPX</span>
          <span><span className="text-amber-400">- -</span> QQQ</span>
        </div>
      </Panel>

      {/* Max drawdown */}
      {!histLoading && drawdowns.length > 0 && (
        <Panel title="Max Drawdown by Position">
          <ResponsiveContainer width="100%" height={Math.max(180, drawdowns.length * 28)}>
            <BarChart data={drawdowns} layout="vertical" margin={{ left: 60, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v) => `-${v}%`} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`-${v}%`, "Max Drawdown"]} />
              <Bar dataKey="dd">
                {drawdowns.map((d, i) => (
                  <Cell key={i} fill={d.dd > 30 ? "#ef4444" : d.dd > 15 ? "#f59e0b" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* Correlation matrix */}
      {!histLoading && corrData && (
        <Panel title="Correlation Matrix (daily returns)">
          <div className="overflow-x-auto">
            <table className="text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="w-20" />
                  {corrData.tickers.map((t) => (
                    <th key={t} className="text-zinc-400 px-2 py-1 text-center">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corrData.tickers.map((rowT, i) => (
                  <tr key={rowT}>
                    <td className="text-zinc-400 pr-3 py-1">{rowT}</td>
                    {corrData.matrix[i].map((v, j) => (
                      <td key={j} className={`text-center px-2 py-1 rounded ${corrColor(v)}`}>{v.toFixed(2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-zinc-600 text-xs mt-2">Red = high corr (≥0.7) · Orange = moderate (0.4–0.7) · Blue = negative</p>
          </div>
        </Panel>
      )}

      {/* Crash playbook */}
      <Panel title="Crash Deploy Playbook">
        <p className="text-sm font-mono text-zinc-300 leading-relaxed">{portfolio.crashPlaybook}</p>
      </Panel>
    </div>
  );
}
