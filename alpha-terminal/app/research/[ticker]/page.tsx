"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Report {
  ticker: string;
  protocol: string;
  reportType: string;
  generatedAt: string;
  updatedAt: string;
  metrics: Record<string, string>;
  scenarios: { scenario: string; annualRevenue: string; multiple: string; impliedFdv: string; returnPct: string }[];
  sections: Record<string, string>;
  inputs: Record<string, string>;
}

const SECTION_LABELS: [string, string][] = [
  ["executiveSummary", "Executive Summary"],
  ["currentState", "Current State"],
  ["whatChanged", "What Changed"],
  ["protocolMechanics", "Protocol Mechanics"],
  ["tractionAndFinancials", "Traction and Financials"],
  ["competitivePositioning", "Competitive Positioning"],
  ["valuationFramework", "Valuation Framework"],
  ["keyRisks", "Key Risks"],
  ["invalidationCriteria", "What Would Invalidate the Thesis"],
  ["dataGapAndEdge", "Data Gap and Edge"],
  ["whyNow", "Why Now"],
  ["positioningPlan", "Positioning & Monitoring Plan"],
  ["conclusion", "Conclusion"],
];

// Render markdown-like bold (**text**) in prose
function Prose({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="text-zinc-100">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

// Render section text — handles bullet lists (lines starting with - or •)
function SectionContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="space-y-2 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-zinc-300 leading-relaxed">
              <span className="text-zinc-600 shrink-0 mt-1">·</span>
              <span><Prose text={item.replace(/^[-•]\s*/, "")} /></span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(i);
      return;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      listItems.push(trimmed);
    } else {
      flushList(i);
      elements.push(
        <p key={i} className="text-zinc-300 leading-relaxed mb-3">
          <Prose text={trimmed} />
        </p>
      );
    }
  });
  flushList(lines.length);

  return <div>{elements}</div>;
}

const SCENARIO_COLORS: Record<string, string> = {
  Bear: "text-red-300",
  Reversion: "text-zinc-300",
  Adoption: "text-blue-300",
  Bull: "text-green-300",
};

export default function ReportPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/research/${ticker}`)
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticker]);

  const saveSection = async () => {
    if (!report || !editingSection) return;
    setSaving(true);
    const updated = { ...report, sections: { ...report.sections, [editingSection]: editText } };
    await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", report: updated }),
    });
    setReport(updated);
    setEditingSection(null);
    setSaving(false);
  };

  const deleteReport = async () => {
    if (!confirm(`Delete ${ticker} report permanently?`)) return;
    setDeleting(true);
    await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ticker }),
    });
    router.push("/research");
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-zinc-500 font-mono text-sm">Loading…</p></div>;
  if (!report) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-zinc-500 font-mono text-sm">Report not found.</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-0">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-zinc-500 mb-1">
              <a href="/research" className="hover:text-zinc-300 transition-colors">Research</a>
              <span className="mx-2">·</span>
              {report.reportType}
            </p>
            <h1 className="text-3xl font-mono font-bold text-zinc-100">
              {report.protocol} ({report.ticker})
            </h1>
            <p className="text-xs font-mono text-zinc-600 mt-2">
              Generated {new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {report.updatedAt !== report.generatedAt && ` · Edited ${new Date(report.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
            </p>
          </div>
          <button
            onClick={deleteReport}
            disabled={deleting}
            className="text-xs font-mono text-zinc-600 hover:text-red-400 transition-colors mt-1"
          >
            {deleting ? "Deleting…" : "Delete report"}
          </button>
        </div>
      </div>

      {/* Metrics table */}
      <section className="mb-10">
        <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Current State</h2>
        <table className="w-full text-sm font-mono border border-zinc-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="text-left px-4 py-2 text-zinc-400 font-medium">Metric</th>
              <th className="text-left px-4 py-2 text-zinc-400 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Price", report.metrics.price],
              ["FDV", report.metrics.fdv],
              ["Circulating Market Cap", report.metrics.circMarketCap],
              ["Price Drawdown from ATH", report.metrics.drawdownFromAth],
              ["Daily Revenue (current)", report.metrics.dailyRevenueCurrent],
              ["Daily Revenue (peak)", report.metrics.dailyRevenuePeak],
              ["Revenue Drawdown from Peak", report.metrics.revenueDrawdown],
              ["Annualized Run Rate", report.metrics.annualizedRevenue],
              ["Forward P/S Multiple", report.metrics.forwardPS],
            ].filter(([, v]) => v).map(([label, value]) => (
              <tr key={label} className="border-t border-zinc-800">
                <td className="px-4 py-2 text-zinc-400">{label}</td>
                <td className="px-4 py-2 text-zinc-200 font-medium">{value}</td>
              </tr>
            ))}
            {report.metrics.otherKpis && (
              <tr className="border-t border-zinc-800">
                <td className="px-4 py-2 text-zinc-400 align-top">Protocol KPIs</td>
                <td className="px-4 py-2 text-zinc-200">{report.metrics.otherKpis}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Valuation scenarios table */}
      {report.scenarios?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Valuation Framework</h2>
          <table className="w-full text-sm font-mono border border-zinc-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-zinc-800/50">
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Scenario</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Annual Revenue</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Multiple</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Implied FDV</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Return</th>
              </tr>
            </thead>
            <tbody>
              {report.scenarios.map((s) => (
                <tr key={s.scenario} className="border-t border-zinc-800">
                  <td className={`px-4 py-2 font-semibold ${SCENARIO_COLORS[s.scenario] ?? "text-zinc-300"}`}>{s.scenario}</td>
                  <td className="px-4 py-2 text-zinc-300">{s.annualRevenue}</td>
                  <td className="px-4 py-2 text-zinc-300">{s.multiple}</td>
                  <td className="px-4 py-2 text-zinc-300">{s.impliedFdv}</td>
                  <td className={`px-4 py-2 font-medium ${
                    s.returnPct.startsWith("+") ? "text-green-400" : s.returnPct.startsWith("-") ? "text-red-400" : "text-zinc-300"
                  }`}>{s.returnPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Narrative sections */}
      {SECTION_LABELS.map(([key, label]) => {
        const content = report.sections?.[key];
        if (!content) return null;
        const isEditing = editingSection === key;
        return (
          <section key={key} className="mb-10 group">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{label}</h2>
              {!isEditing && (
                <button
                  onClick={() => { setEditingSection(key); setEditText(content); }}
                  className="text-xs font-mono text-zinc-700 hover:text-zinc-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  rows={12}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
                <div className="flex gap-3">
                  <button onClick={saveSection} disabled={saving}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded transition-colors">
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditingSection(null)}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-mono rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <SectionContent text={content} />
            )}
          </section>
        );
      })}

      <div className="border-t border-zinc-800 pt-6 mt-6">
        <p className="text-xs font-mono text-zinc-700">
          Alpha Terminal · {report.reportType} · {report.ticker} · {new Date(report.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
