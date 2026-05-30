"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import portfolio from "@/data/portfolio.json";

interface PriceMap {
  [ticker: string]: { price: number; changePercent1d: number };
}

interface DomData {
  btcDominance: number;
}

const sections = [
  {
    href: "/portfolio",
    label: "Portfolio",
    description: "Live P&L · Backtester · Correlation matrix",
    color: "border-blue-800 hover:border-blue-600",
    tag: "blue",
  },
  {
    href: "/crypto",
    label: "Crypto Alpha",
    description: "BTC dominance · Short screener · Funding rates",
    color: "border-purple-800 hover:border-purple-600",
    tag: "purple",
  },
  {
    href: "/catalyst",
    label: "Catalyst Calendar",
    description: "Upcoming events · War-game playbooks",
    color: "border-amber-800 hover:border-amber-600",
    tag: "amber",
  },
  {
    href: "/opportunity",
    label: "Opportunity Set",
    description: "2026 regime trades · Druckenmiller framework",
    color: "border-green-800 hover:border-green-600",
    tag: "green",
  },
];

export default function DashboardPage() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [dom, setDom] = useState<DomData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tickers = portfolio.positions.map((p) => p.ticker).join(",");
    Promise.allSettled([
      fetch(`/api/prices?tickers=${encodeURIComponent(tickers)}`).then((r) => r.json()),
      fetch("/api/btc-dominance").then((r) => r.json()),
    ]).then(([priceRes, domRes]) => {
      if (priceRes.status === "fulfilled") setPrices(priceRes.value);
      if (domRes.status === "fulfilled") setDom(domRes.value);
      setLoading(false);
    });
  }, []);

  const activePosns = portfolio.positions.filter((p) => !p.watchlist || p.units > 0);
  const totalUnits = activePosns.reduce((s, p) => s + p.units, 0);

  const totalValue = activePosns.reduce((s, p) => {
    const q = prices[p.ticker];
    return s + (q ? q.price * p.units * (portfolio.unitValue / 100) : 0);
  }, 0);

  const dailyPnL = activePosns.reduce((s, p) => {
    const q = prices[p.ticker];
    if (!q) return s;
    const val = q.price * p.units * (portfolio.unitValue / 100);
    return s + (val * q.changePercent1d) / 100;
  }, 0);

  const btcDom = dom?.btcDominance;
  const altSignal = btcDom !== undefined
    ? btcDom < 55 ? "WATCH" : "WAIT"
    : "—";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold text-zinc-100">
          alpha<span className="text-blue-400">.</span>terminal
        </h1>
        <p className="text-zinc-500 text-sm font-mono mt-1">Private investment research tool · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-mono text-zinc-500 mb-1">Portfolio Value</p>
          <p className="text-xl font-mono font-bold text-zinc-100">
            {loading ? "—" : `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-mono text-zinc-500 mb-1">Daily P&L</p>
          <p className={`text-xl font-mono font-bold ${dailyPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {loading ? "—" : `${dailyPnL >= 0 ? "+" : ""}$${Math.abs(dailyPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-mono text-zinc-500 mb-1">BTC Dominance</p>
          <p className="text-xl font-mono font-bold text-zinc-100">
            {loading ? "—" : btcDom !== undefined ? `${btcDom.toFixed(1)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-mono text-zinc-500 mb-1">Alt Season Signal</p>
          <p className={`text-xl font-mono font-bold ${altSignal === "WATCH" ? "text-green-400" : "text-amber-400"}`}>
            {loading ? "—" : altSignal}
          </p>
          <p className="text-xs text-zinc-600 font-mono mt-1">BTC dom {"<"} 55% = rotate</p>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <div className={`rounded-xl border bg-zinc-900/30 p-6 transition-colors cursor-pointer ${s.color}`}>
              <h2 className="font-mono font-semibold text-zinc-100 text-lg mb-1">{s.label}</h2>
              <p className="text-sm font-mono text-zinc-500">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Mini portfolio snapshot */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h3 className="font-mono text-sm text-zinc-400 mb-3">Portfolio Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {activePosns.map((p) => {
            const q = prices[p.ticker];
            return (
              <div key={p.ticker} className="text-center">
                <p className="text-xs font-mono text-zinc-500">{p.ticker}</p>
                <p className="text-sm font-mono text-zinc-200">
                  {q ? `$${q.price < 100 ? q.price.toFixed(2) : q.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                </p>
                <p className={`text-xs font-mono ${q && q.changePercent1d >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {q ? `${q.changePercent1d >= 0 ? "+" : ""}${q.changePercent1d.toFixed(2)}%` : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
