"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import Panel from "@/components/Panel";
import StatCard from "@/components/StatCard";

interface HistoryPoint {
  date: string;
  btcDominance: number;
}

interface DominanceData {
  btcDominance: number;
  ethDominance: number;
  totalMarketCap: number;
  marketCapChange24h: number;
  history?: HistoryPoint[];
}

interface CoinData {
  symbol: string;
  name: string;
  marketCap: number;
  fdv: number;
  price: number;
  change7d: number;
  floatRatio: number;
}

interface FundingRow {
  symbol: string;
  bybit: number | null;
  binance: number | null;
}

interface LiqBucket {
  hour: string;
  longLiq: number;
  shortLiq: number;
  oiUsd: number;
  price: number;
}

interface LiqData {
  buckets: LiqBucket[];
  signal: string;
  signalType: "bullish" | "bearish" | "neutral";
}

interface TrendingCoin {
  symbol: string;
  name: string;
  rank: number | null;
  change24h: number | null;
  price: string | null;
}

function fmtB(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function CryptoPage() {
  const [dom, setDom] = useState<DominanceData | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [funding, setFunding] = useState<FundingRow[]>([]);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [liq, setLiq] = useState<LiqData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(() => {
    setLoading(true);
    const ts = Date.now();
    Promise.allSettled([
      fetch(`/api/btc-dominance?history=30&_t=${ts}`).then((r) => r.json()),
      fetch(`/api/coingecko?_t=${ts}`).then((r) => r.json()),
      fetch(`/api/funding?_t=${ts}`).then((r) => r.json()),
      fetch(`/api/trending?_t=${ts}`).then((r) => r.json()),
      fetch(`/api/liquidations?_t=${ts}`).then((r) => r.json()),
    ]).then(([domRes, coinsRes, fundRes, trendRes, liqRes]) => {
      if (domRes.status === "fulfilled") setDom(domRes.value);
      if (coinsRes.status === "fulfilled" && Array.isArray(coinsRes.value)) setCoins(coinsRes.value);
      if (fundRes.status === "fulfilled" && Array.isArray(fundRes.value)) setFunding(fundRes.value);
      if (trendRes.status === "fulfilled" && Array.isArray(trendRes.value?.coins)) setTrending(trendRes.value.coins);
      if (liqRes.status === "fulfilled" && liqRes.value?.buckets) setLiq(liqRes.value);
      setLoading(false);
    });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  // Short screener: low float (FDV/mcap ratio > 3x) = floatRatio < 0.33
  const shortCandidates = coins
    .filter((c) => c.floatRatio < 0.33 && c.fdv > 50_000_000)
    .sort((a, b) => a.floatRatio - b.floatRatio)
    .slice(0, 20);

  const btcSignal =
    dom?.btcDominance !== null && dom?.btcDominance !== undefined
      ? dom.btcDominance > 60
        ? { text: "Stay BTC-only. Retail hasn't returned.", color: "text-amber-400" }
        : dom.btcDominance < 55
        ? { text: "Dominance falling — monitor for alt rotation signal.", color: "text-green-400" }
        : { text: "Neutral zone. Watch trend direction.", color: "text-zinc-400" }
      : null;

  const historyData = dom?.history ?? [];
  // Thin to ~15 points for a clean chart if there are many
  const chartData = historyData.length > 15
    ? historyData.filter((_, i) => i % Math.floor(historyData.length / 15) === 0 || i === historyData.length - 1)
    : historyData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Crypto Alpha</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">BTC dominance · Trending · Short screener · Funding rates</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-mono rounded border border-zinc-700 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm font-mono">Loading…</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="BTC Dominance"
              value={dom ? `${dom.btcDominance.toFixed(1)}%` : "—"}
              delta={btcSignal?.text}
              deltaPositive={dom?.btcDominance !== undefined && dom.btcDominance < 55}
            />
            <StatCard
              label="ETH Dominance"
              value={dom ? `${dom.ethDominance.toFixed(1)}%` : "—"}
            />
            <StatCard
              label="Total Crypto Market Cap"
              value={dom ? fmtB(dom.totalMarketCap) : "—"}
              delta={dom ? `${dom.marketCapChange24h >= 0 ? "+" : ""}${dom.marketCapChange24h.toFixed(2)}% 24h` : undefined}
              deltaPositive={(dom?.marketCapChange24h ?? 0) >= 0}
            />
            <StatCard
              label="Alt Season Signal"
              value={dom ? (dom.btcDominance < 55 ? "WATCH" : "WAIT") : "—"}
              sub="Trigger: BTC dom < 55% & falling"
            />
          </div>

          {/* BTC Dominance 30-day chart */}
          {chartData.length > 1 && (
            <Panel title="BTC Dominance — 30 Day">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#71717a", fontFamily: "monospace" }}
                      tickFormatter={(v: string) => v.slice(5)}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "#71717a", fontFamily: "monospace" }}
                      tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => [`${(v as number).toFixed(2)}%`, "BTC Dom"]}
                    />
                    <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "55% (alt trigger)", position: "insideTopRight", fontSize: 10, fill: "#f59e0b", fontFamily: "monospace" }} />
                    <Line
                      type="monotone"
                      dataKey="btcDominance"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-zinc-600 font-mono mt-2">
                {">"} 60% = BTC only · Below 55% and falling = begin alt rotation · Alt season requires retail liquidity event to sustain.
              </p>
            </Panel>
          )}

          {/* Liquidations panel */}
          {liq && liq.buckets.length > 0 && (
            <Panel title="BTC Liquidation Proxy — 48h">
              <p className="text-xs text-zinc-600 font-mono mb-3">
                Derived from Binance USDT-perp OI changes. OI drop + price drop = estimated long liq (red). OI drop + price rise = estimated short liq (green).
              </p>
              {/* Signal */}
              <p className={`text-sm font-mono mb-4 ${
                liq.signalType === "bullish" ? "text-green-400"
                : liq.signalType === "bearish" ? "text-amber-400"
                : "text-zinc-500"
              }`}>
                {liq.signal}
              </p>
              {/* Chart: short liq above axis (green), long liq below (red) */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={liq.buckets.map((b) => ({
                      ...b,
                      shortLiqPos: b.shortLiq,
                      longLiqNeg: -b.longLiq,
                    }))}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#52525b", fontFamily: "monospace" }}
                      interval={7}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#71717a", fontFamily: "monospace" }}
                      tickFormatter={(v: number) => `$${Math.abs(v).toFixed(0)}M`}
                    />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any, name: any) => {
                        const val = Math.abs(v as number);
                        const label = name === "shortLiqPos" ? "Short liq" : "Long liq";
                        return [`$${val.toFixed(1)}M`, label];
                      }}
                    />
                    <ReferenceLine y={0} stroke="#3f3f46" />
                    <Bar dataKey="shortLiqPos" name="shortLiqPos" fill="#4ade80" radius={[2, 2, 0, 0]}>
                      {liq.buckets.map((_, i) => (
                        <Cell key={i} fill="#4ade80" fillOpacity={0.8} />
                      ))}
                    </Bar>
                    <Bar dataKey="longLiqNeg" name="longLiqNeg" fill="#f87171" radius={[0, 0, 2, 2]}>
                      {liq.buckets.map((_, i) => (
                        <Cell key={i} fill="#f87171" fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2 text-xs font-mono text-zinc-600">
                <span><span className="text-green-400">■</span> Short liquidations (above)</span>
                <span><span className="text-red-400">■</span> Long liquidations (below)</span>
              </div>
            </Panel>
          )}

          {/* Trending Narratives */}
          {trending.length > 0 && (
            <Panel title="Trending Narratives">
              <p className="text-xs text-zinc-500 font-mono mb-3">
                CoinGecko trending — potential narrative momentum. Cross-reference with BTC dominance signal before sizing.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {trending.map((c) => (
                  <div key={c.symbol} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-2.5">
                    <p className="font-mono text-sm text-zinc-100 font-bold">{c.symbol}</p>
                    <p className="text-xs text-zinc-500 font-mono truncate">{c.name}</p>
                    {c.rank && (
                      <p className="text-xs text-zinc-600 font-mono mt-1">Rank #{c.rank}</p>
                    )}
                    {c.change24h !== null && (
                      <p className={`text-xs font-mono mt-0.5 font-medium ${c.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.change24h >= 0 ? "+" : ""}{c.change24h.toFixed(1)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Short screener */}
          <Panel title="Short Screener — Low Float / High FDV">
            <p className="text-xs text-zinc-500 font-mono mb-3">
              Post-TGE alts with FDV/market cap ratio {">"} 3x — structural selling pressure from unlocks + no retail bid.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 pr-4">Symbol</th>
                    <th className="text-right pr-4">Market Cap</th>
                    <th className="text-right pr-4">FDV</th>
                    <th className="text-right pr-4">Float%</th>
                    <th className="text-right">7d Δ%</th>
                  </tr>
                </thead>
                <tbody>
                  {shortCandidates.map((c) => (
                    <tr key={c.symbol} className="border-b border-zinc-800/40">
                      <td className="py-2 pr-4 text-zinc-200">{c.symbol}<span className="text-zinc-600 ml-2 text-xs">{c.name}</span></td>
                      <td className="pr-4 text-right text-zinc-300">{fmtB(c.marketCap)}</td>
                      <td className="pr-4 text-right text-zinc-300">{fmtB(c.fdv)}</td>
                      <td className="pr-4 text-right text-red-400">{(c.floatRatio * 100).toFixed(1)}%</td>
                      <td className={`text-right ${c.change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.change7d >= 0 ? "+" : ""}{c.change7d?.toFixed(1) ?? "—"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Funding rates */}
          <Panel title="Funding Rates (annualised)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 pr-4">Symbol</th>
                    <th className="text-right pr-4">Bybit</th>
                    <th className="text-right pr-4">Binance</th>
                    <th className="text-right">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {funding.map((f) => {
                    const avg = [f.bybit, f.binance].filter((v): v is number => v !== null);
                    const mean = avg.length ? avg.reduce((s, v) => s + v, 0) / avg.length : null;
                    const signal =
                      mean === null ? "—"
                      : mean > 50 ? "Crowded long"
                      : mean < -10 ? "Crowded short"
                      : "Neutral";
                    const signalColor =
                      mean !== null && mean > 50 ? "text-red-400"
                      : mean !== null && mean < -10 ? "text-green-400"
                      : "text-zinc-500";
                    return (
                      <tr key={f.symbol} className="border-b border-zinc-800/40">
                        <td className="py-2 pr-4 text-zinc-200">{f.symbol}</td>
                        <td className={`pr-4 text-right ${f.bybit !== null ? (f.bybit > 20 ? "text-amber-400" : "text-zinc-300") : "text-zinc-600"}`}>
                          {f.bybit !== null ? `${f.bybit.toFixed(1)}%` : "—"}
                        </td>
                        <td className={`pr-4 text-right ${f.binance !== null ? (f.binance > 20 ? "text-amber-400" : "text-zinc-300") : "text-zinc-600"}`}>
                          {f.binance !== null ? `${f.binance.toFixed(1)}%` : "—"}
                        </td>
                        <td className={`text-right text-xs ${signalColor}`}>{signal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
