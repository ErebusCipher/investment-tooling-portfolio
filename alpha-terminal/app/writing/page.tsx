"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Panel from "@/components/Panel";

interface ReportSummary {
  ticker: string;
  protocol: string;
  reportType: string;
  generatedAt: string;
  updatedAt: string;
  wordCount: number;
}

const REPORT_TYPES = ["Investment Pitch", "Sector Overview", "Exit Analysis", "Position Update"];

// DefiLlama category names for the sector dropdown
const LLAMA_CATEGORIES = [
  "AI Agents",
  "Bridge",
  "CDP",
  "Cross Chain",
  "Decentralized AI",
  "DePIN",
  "Derivatives",
  "Dexs",
  "Gaming",
  "Indexes",
  "Lending",
  "Liquid Staking",
  "NFT Marketplace",
  "Options",
  "Oracle",
  "Payments",
  "Prediction Market",
  "Restaking",
  "RWA",
  "Synthetics",
  "Yield",
  "Yield Aggregator",
];

function sectorToSlug(name: string): string {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function WritingPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Shared
  const [reportType, setReportType] = useState("Investment Pitch");
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Protocol-level fields
  const [protocol, setProtocol] = useState("");
  const [ticker, setTicker] = useState("");
  const [entryPrice, setEntryPrice] = useState("");

  // Sector Overview fields
  const [sector, setSector] = useState("");
  const [llamaCategory, setLlamaCategory] = useState("AI Agents");

  const isSectorOverview = reportType === "Sector Overview";
  const hasEntryPrice = reportType === "Exit Analysis" || reportType === "Position Update";

  const canGenerate = isSectorOverview
    ? sector.trim().length > 0
    : protocol.trim().length > 0 && ticker.trim().length > 0;

  const load = () => {
    fetch("/api/writing")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setError(null);

    const effectiveTicker = isSectorOverview
      ? sectorToSlug(llamaCategory || sector)
      : ticker.trim().toUpperCase();

    const effectiveProtocol = isSectorOverview ? sector.trim() : protocol.trim();

    try {
      setStatus(
        isSectorOverview
          ? "Fetching sector data from DefiLlama…"
          : "Fetching live data from CoinGecko + DefiLlama…"
      );

      setStatus("Writing report — this takes ~30–45 seconds…");

      const res = await fetch("/api/writing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol: effectiveProtocol,
          ticker: effectiveTicker,
          reportType,
          ...(isSectorOverview ? { llamaCategory: llamaCategory || sector } : {}),
          ...(hasEntryPrice && entryPrice.trim() ? { entryPrice: entryPrice.trim() } : {}),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setGenerating(false);
        setStatus(null);
        return;
      }

      setStatus("Saving…");
      await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          report: {
            ticker: effectiveTicker,
            protocol: effectiveProtocol,
            reportType,
            content: data.content,
            metrics: data.metrics ?? {},
            geckoId: data.geckoId ?? "",
            llamaSlug: data.llamaSlug ?? "",
            generatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      window.location.href = `/writing/${effectiveTicker}`;
    } catch (e) {
      setError(String(e));
      setGenerating(false);
      setStatus(null);
    }
  };

  const inputCls =
    "bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Writing</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">
            Institutional research · AI-authored · Spartan-style
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setStatus(null);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-mono rounded transition-colors"
        >
          {showForm ? "Cancel" : "+ New Report"}
        </button>
      </div>

      {showForm && (
        <Panel title="New Report">
          {/* Report type selector */}
          <div className="mb-4">
            <label className="text-xs font-mono text-zinc-500 block mb-1">Report Type</label>
            <div className="flex gap-2 flex-wrap">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => { setReportType(t); setError(null); }}
                  disabled={generating}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    reportType === t
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs: Sector Overview */}
          {isSectorOverview && (
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-mono text-zinc-500 block mb-1">Sector Name</label>
                <input
                  className={`${inputCls} w-full`}
                  placeholder="AI Agents"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  disabled={generating}
                />
              </div>
              <div className="w-52">
                <label className="text-xs font-mono text-zinc-500 block mb-1">DefiLlama Category</label>
                <select
                  className={`${inputCls} w-full`}
                  value={llamaCategory}
                  onChange={(e) => setLlamaCategory(e.target.value)}
                  disabled={generating}
                >
                  {LLAMA_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={generate}
                disabled={generating || !canGenerate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded transition-colors shrink-0"
              >
                {generating ? "Generating…" : "Generate"}
              </button>
            </div>
          )}

          {/* Inputs: Protocol-level reports */}
          {!isSectorOverview && (
            <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-40">
                <label className="text-xs font-mono text-zinc-500 block mb-1">Protocol</label>
                <input
                  className={`${inputCls} w-full`}
                  placeholder="Virtuals Protocol"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  disabled={generating}
                />
              </div>
              <div className="w-28">
                <label className="text-xs font-mono text-zinc-500 block mb-1">Ticker</label>
                <input
                  className={`${inputCls} w-full uppercase`}
                  placeholder="VIRTUAL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  disabled={generating}
                />
              </div>
              {hasEntryPrice && (
                <div className="w-36">
                  <label className="text-xs font-mono text-zinc-500 block mb-1">
                    Entry Price ($) <span className="text-zinc-700">optional</span>
                  </label>
                  <input
                    className={`${inputCls} w-full`}
                    placeholder="0.69"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generate()}
                    disabled={generating}
                  />
                </div>
              )}
              <button
                onClick={generate}
                disabled={generating || !canGenerate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded transition-colors shrink-0"
              >
                {generating ? "Generating…" : "Generate"}
              </button>
            </div>
          )}

          {/* Status / error */}
          {status && (
            <p className="mt-3 text-xs font-mono text-zinc-500 animate-pulse">{status}</p>
          )}
          {error && (
            <p className="mt-3 text-xs font-mono text-red-400">Error: {error}</p>
          )}

          {/* Helper text per type */}
          <p className="mt-4 text-xs font-mono text-zinc-700">
            {reportType === "Investment Pitch" &&
              "Claude fetches live CoinGecko + DefiLlama data, then writes a full 12-section institutional pitch."}
            {reportType === "Sector Overview" &&
              "Claude fetches the top protocols in the selected DefiLlama category, then writes a cross-protocol sector analysis."}
            {reportType === "Exit Analysis" &&
              "Claude fetches current market data and writes a 10-section exit memo comparing original thesis vs. current reality."}
            {reportType === "Position Update" &&
              "Claude fetches current market data and writes a concise 7-section monitoring update with a scorecard and recommendation."}
          </p>
        </Panel>
      )}

      {reports.length === 0 && !showForm ? (
        <Panel>
          <p className="text-zinc-500 text-sm font-mono">
            No reports yet. Click &quot;+ New Report&quot; to generate one.
          </p>
        </Panel>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <Link key={`${r.ticker}-${r.reportType}`} href={`/writing/${r.ticker}`}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 px-5 py-4 hover:border-zinc-600 transition-colors cursor-pointer flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-zinc-100 w-24 shrink-0">
                    {r.ticker}
                  </span>
                  <span className="text-sm font-mono text-zinc-400">{r.protocol}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-500">
                    {r.reportType}
                  </span>
                  <span className="text-xs font-mono text-zinc-700 hidden sm:block">
                    {r.wordCount.toLocaleString()} words
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-zinc-600">
                    {new Date(r.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
