"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Panel from "@/components/Panel";

interface ReportSummary {
  ticker: string;
  protocol: string;
  reportType: string;
  generatedAt: string;
  updatedAt: string;
}

interface ValuationScenario {
  scenario: string;
  annualRevenue: string;
  multiple: string;
  impliedFdv: string;
  returnPct: string;
}

const BLANK_SCENARIOS: ValuationScenario[] = [
  { scenario: "Bear", annualRevenue: "", multiple: "", impliedFdv: "", returnPct: "" },
  { scenario: "Reversion", annualRevenue: "", multiple: "", impliedFdv: "", returnPct: "" },
  { scenario: "Adoption", annualRevenue: "", multiple: "", impliedFdv: "", returnPct: "" },
  { scenario: "Bull", annualRevenue: "", multiple: "", impliedFdv: "", returnPct: "" },
];

const BLANK_METRICS = {
  price: "", fdv: "", circMarketCap: "", drawdownFromAth: "",
  dailyRevenueCurrent: "", dailyRevenuePeak: "", revenueDrawdown: "",
  annualizedRevenue: "", forwardPS: "", otherKpis: "",
};

const BLANK_INPUTS = {
  protocol: "", ticker: "", reportType: "Investment Pitch",
  whatChanged: "", protocolMechanics: "", tokenomics: "",
  revenueHistory: "", competitors: "", scenarioProbabilities: "Bear 40%, Reversion 30%, Adoption 20%, Bull 10%",
  keyRisks: "", invalidationCriteria: "", dataGapAndEdge: "",
  whyNow: "", positioningPlan: "",
};

export default function ResearchPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [inputs, setInputs] = useState(BLANK_INPUTS);
  const [metrics, setMetrics] = useState(BLANK_METRICS);
  const [scenarios, setScenarios] = useState<ValuationScenario[]>(BLANK_SCENARIOS);
  const [generating, setGenerating] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [prefillStatus, setPrefillStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prefillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = () => {
    fetch("/api/research").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
  };

  useEffect(() => { load(); }, []);

  // Auto-prefill: triggers 800ms after both protocol + ticker are non-empty
  useEffect(() => {
    if (!inputs.protocol || !inputs.ticker || inputs.protocol.length < 2 || inputs.ticker.length < 1) return;
    if (prefillTimer.current) clearTimeout(prefillTimer.current);
    prefillTimer.current = setTimeout(async () => {
      setPrefilling(true);
      setPrefillStatus(null);
      try {
        const res = await fetch(
          `/api/research/prefill?query=${encodeURIComponent(inputs.protocol)}&ticker=${encodeURIComponent(inputs.ticker)}`
        );
        const data = await res.json();
        if (data.error) {
          setPrefillStatus({ ok: false, msg: data.error });
        } else {
          setMetrics((prev) => {
            // Only overwrite fields that are currently empty
            const merged = { ...prev };
            for (const [k, v] of Object.entries(data.metrics as Record<string, string>)) {
              if (!merged[k as keyof typeof prev] && v) merged[k as keyof typeof prev] = v;
            }
            return merged;
          });
          if (data.revenueHistory) {
            setInputs((prev) => ({ ...prev, revenueHistory: prev.revenueHistory || data.revenueHistory }));
          }
          setPrefillStatus({
            ok: true,
            msg: `Live data fetched — CoinGecko (${data.geckoId})${data.llamaSlug ? ` + DefiLlama (${data.llamaSlug})` : " · DefiLlama: no match"}`,
          });
        }
      } catch (e) {
        setPrefillStatus({ ok: false, msg: String(e) });
      }
      setPrefilling(false);
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.protocol, inputs.ticker]);

  const generate = async () => {
    if (!inputs.protocol || !inputs.ticker) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/research/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, metrics, scenarios }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setGenerating(false); return; }

      // Save the report
      await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          report: {
            ticker: inputs.ticker.toUpperCase(),
            protocol: inputs.protocol,
            reportType: inputs.reportType,
            generatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metrics,
            scenarios,
            sections: data.sections,
            inputs,
          },
        }),
      });

      setShowForm(false);
      setInputs(BLANK_INPUTS);
      setMetrics(BLANK_METRICS);
      setScenarios(BLANK_SCENARIOS);
      setPrefillStatus(null);
      load();
      // Navigate to the report
      window.location.href = `/research/${inputs.ticker.toUpperCase()}`;
    } catch (e) {
      setError(String(e));
    }
    setGenerating(false);
  };

  const inp = (field: keyof typeof inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setInputs((v) => ({ ...v, [field]: e.target.value }));
  const met = (field: keyof typeof metrics) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setMetrics((v) => ({ ...v, [field]: e.target.value }));

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500";
  const labelCls = "text-xs font-mono text-zinc-500 block mb-1";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Research</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Institutional crypto investment pitches · AI-drafted · Spartan-style</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) { setInputs(BLANK_INPUTS); setMetrics(BLANK_METRICS); setScenarios(BLANK_SCENARIOS); setPrefillStatus(null); } }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-mono rounded transition-colors"
        >
          {showForm ? "Cancel" : "+ New Report"}
        </button>
      </div>

      {/* Generation form */}
      {showForm && (
        <div className="space-y-4">
          <Panel title="Protocol">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Protocol Name</label>
                <input className={inputCls} placeholder="Virtuals Protocol" value={inputs.protocol} onChange={inp("protocol")} />
              </div>
              <div>
                <label className={labelCls}>Ticker</label>
                <input className={inputCls} placeholder="VIRTUAL" value={inputs.ticker} onChange={inp("ticker")} />
              </div>
              <div>
                <label className={labelCls}>Report Type</label>
                <select className={inputCls} value={inputs.reportType} onChange={inp("reportType")}>
                  <option>Investment Pitch</option>
                  <option>Sector Overview</option>
                  <option>Exit Analysis</option>
                  <option>Position Update</option>
                </select>
              </div>
            </div>
            {/* Prefill status */}
            {prefilling && (
              <p className="mt-3 text-xs font-mono text-zinc-500 animate-pulse">
                Fetching live data from CoinGecko + DefiLlama…
              </p>
            )}
            {prefillStatus && !prefilling && (
              <p className={`mt-3 text-xs font-mono ${prefillStatus.ok ? "text-green-500" : "text-amber-400"}`}>
                {prefillStatus.ok ? "✓ " : "⚠ "}{prefillStatus.msg}
              </p>
            )}
          </Panel>

          <Panel title="Current Metrics">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {([
                ["Price", "price", "~$0.69"],
                ["FDV", "fdv", "~$690M"],
                ["Circ. Market Cap", "circMarketCap", "~$452M"],
                ["Drawdown from ATH", "drawdownFromAth", "-86%"],
                ["Daily Revenue (current)", "dailyRevenueCurrent", "~$35K"],
                ["Daily Revenue (peak)", "dailyRevenuePeak", "~$535K"],
                ["Revenue Drawdown", "revenueDrawdown", "-93%"],
                ["Annualized Revenue", "annualizedRevenue", "~$13M"],
                ["Forward P/S", "forwardPS", "~53x"],
              ] as [string, keyof typeof metrics, string][]).map(([label, field, placeholder]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input className={inputCls} placeholder={placeholder} value={metrics[field]} onChange={met(field)} />
                </div>
              ))}
              <div className="md:col-span-5">
                <label className={labelCls}>Other Protocol KPIs (agents deployed, DEX volume, etc.)</label>
                <input className={inputCls} placeholder="18,000+ agents deployed, $8B+ cumulative DEX volume, 1.77M completed jobs" value={metrics.otherKpis} onChange={met("otherKpis")} />
              </div>
            </div>
          </Panel>

          <Panel title="Valuation Scenarios">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 pr-4 w-28">Scenario</th>
                    <th className="pr-4">Annual Revenue</th>
                    <th className="pr-4">Multiple</th>
                    <th className="pr-4">Implied FDV</th>
                    <th>Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s, i) => (
                    <tr key={s.scenario} className="border-b border-zinc-800/40">
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          s.scenario === "Bear" ? "bg-red-900/40 text-red-300"
                          : s.scenario === "Reversion" ? "bg-zinc-800 text-zinc-300"
                          : s.scenario === "Adoption" ? "bg-blue-900/40 text-blue-300"
                          : "bg-green-900/40 text-green-300"
                        }`}>{s.scenario}</span>
                      </td>
                      {(["annualRevenue", "multiple", "impliedFdv", "returnPct"] as const).map((f) => (
                        <td key={f} className="pr-4 py-1">
                          <input
                            className={inputCls}
                            value={s[f]}
                            placeholder={f === "annualRevenue" ? "$30M" : f === "multiple" ? "20x" : f === "impliedFdv" ? "$600M" : "-13%"}
                            onChange={(e) => setScenarios((prev) => prev.map((row, j) => j === i ? { ...row, [f]: e.target.value } : row))}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <label className={labelCls}>Scenario Probabilities</label>
              <input className={inputCls} value={inputs.scenarioProbabilities} onChange={inp("scenarioProbabilities")} />
            </div>
          </Panel>

          <Panel title="Thesis Inputs">
            <div className="space-y-4">
              {([
                ["What Changed / The Catalyst", "whatChanged", "Describe the structural change, when it happened, and why it matters. What was the revenue model before? What is it after?", 3],
                ["Protocol Mechanics (token utility)", "protocolMechanics", "List each token utility function. e.g. Gas: agents consume VIRTUAL per action. Staking: apps require locked VIRTUAL.", 3],
                ["Tokenomics", "tokenomics", "Total supply, circulating supply, vesting status, upcoming unlocks, treasury size and controller.", 2],
                ["Revenue History", "revenueHistory", "When did revenue peak? What drove the peak? What caused the decline? What is the current baseline? Secondary bounces?", 3],
                ["Competitors", "competitors", "Name each competitor and how they monetize. Include FDV and revenue comparisons where known.", 3],
                ["Key Risks", "keyRisks", "List each risk with a label. Be honest. Include structural, narrative, competitive, and token risks.", 3],
                ["Invalidation Criteria", "invalidationCriteria", "What specific, measurable data conditions would cause you to exit? Include timeframe.", 2],
                ["Data Gap & Edge", "dataGapAndEdge", "What data is not yet publicly available? When will the first clean signal appear? Is the edge temporal or informational?", 2],
                ["Why Now (3 conditions)", "whyNow", "Three specific reasons why this moment is the entry. Not general wisdom — specific to the current protocol state and market.", 3],
                ["Positioning Plan", "positioningPlan", "Initial position size, review window, escalate-if conditions, exit-if conditions, additional allocation principle.", 3],
              ] as [string, keyof typeof inputs, string, number][]).map(([label, field, placeholder, rows]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <textarea
                    rows={rows}
                    className={inputCls}
                    placeholder={placeholder}
                    value={inputs[field]}
                    onChange={inp(field)}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={generate}
              disabled={generating || !inputs.protocol || !inputs.ticker}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono rounded transition-colors"
            >
              {generating ? "Generating report…" : "Generate Report"}
            </button>
            {generating && (
              <p className="text-zinc-500 text-sm font-mono">Calling Claude on 13 sections — takes ~30 seconds…</p>
            )}
          </div>
        </div>
      )}

      {/* Report library */}
      {reports.length === 0 && !showForm ? (
        <Panel>
          <p className="text-zinc-500 text-sm font-mono">No reports yet. Click &quot;+ New Report&quot; to generate your first.</p>
        </Panel>
      ) : reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r) => (
            <Link key={r.ticker} href={`/research/${r.ticker}`}>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/30 px-5 py-4 hover:border-zinc-500 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-zinc-100">{r.ticker}</span>
                    <span className="text-sm font-mono text-zinc-400">{r.protocol}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400">{r.reportType}</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-mono mt-1">
                    Generated {new Date(r.generatedAt).toLocaleDateString()} · Updated {new Date(r.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-zinc-600 text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
