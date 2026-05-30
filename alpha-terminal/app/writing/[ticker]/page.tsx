"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Report {
  ticker: string;
  protocol: string;
  reportType: string;
  content: string;
  metrics: Record<string, string>;
  geckoId?: string;
  llamaSlug?: string;
  generatedAt: string;
  updatedAt: string;
}

const METRIC_LABELS: [string, string][] = [
  ["price", "Price"],
  ["fdv", "FDV"],
  ["circMarketCap", "Circulating Market Cap"],
  ["drawdownFromAth", "Price Drawdown from ATH"],
  ["dailyRevenueCurrent", "Daily Revenue (current)"],
  ["dailyRevenuePeak", "Daily Revenue (peak)"],
  ["revenueDrawdown", "Revenue Drawdown from Peak"],
  ["annualizedRevenue", "Annualized Run Rate"],
  ["forwardPS", "Forward P/S Multiple"],
  ["otherKpis", "Token Supply / Float"],
];

// Render bold markers (**text**) inline
function Prose({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="font-semibold text-zinc-100">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

// Parse full markdown into rendered sections
function ReportBody({ content }: { content: string }) {
  // Split on ## headers
  const chunks = content.split(/^## /m).filter(Boolean);

  return (
    <div className="space-y-10">
      {chunks.map((chunk, idx) => {
        const newline = chunk.indexOf("\n");
        const heading = newline > -1 ? chunk.slice(0, newline).trim() : chunk.trim();
        const body = newline > -1 ? chunk.slice(newline + 1).trim() : "";

        return (
          <section key={idx}>
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-5 pb-2 border-b border-zinc-800/60">
              {heading}
            </h2>
            <BodyContent text={body} />
          </section>
        );
      })}
    </div>
  );
}

function BodyContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (!listBuf.length) return;
    out.push(
      <ul key={`ul-${listKey++}`} className="space-y-2.5 my-4 pl-1">
        {listBuf.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-zinc-600 shrink-0 select-none mt-0.5">·</span>
            <span className="text-zinc-300 leading-relaxed text-[15px]">
              <Prose text={item.replace(/^[-•*]\s*/, "")} />
            </span>
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { flushList(); return; }
    if (/^[-•*] /.test(t)) {
      listBuf.push(t);
    } else {
      flushList();
      out.push(
        <p key={i} className="text-zinc-300 leading-relaxed text-[15px] mb-3">
          <Prose text={t} />
        </p>
      );
    }
  });
  flushList();

  return <div>{out}</div>;
}

export default function WritingReportPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/writing/${ticker}`)
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ticker]);

  const saveEdit = async () => {
    if (!report) return;
    setSaving(true);
    const updated = { ...report, content: editContent };
    await fetch("/api/writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", report: updated }),
    });
    setReport(updated);
    setEditing(false);
    setSaving(false);
  };

  const del = async () => {
    if (!confirm(`Delete ${ticker} report?`)) return;
    await fetch("/api/writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ticker }),
    });
    router.push("/writing");
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="text-zinc-500 font-mono text-sm">Loading…</p></div>;
  if (!report || !report.content) return <div className="max-w-3xl mx-auto px-4 py-16"><p className="text-zinc-500 font-mono text-sm">Report not found.</p></div>;

  const hasMetrics = Object.values(report.metrics ?? {}).some(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-zinc-800">
        <p className="text-xs font-mono text-zinc-600 mb-3">
          <a href="/writing" className="hover:text-zinc-400 transition-colors">Writing</a>
          <span className="mx-2">·</span>
          <span>{report.reportType}</span>
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 leading-tight">
          {report.protocol} <span className="text-zinc-500 font-normal">({report.ticker})</span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <p className="text-xs font-mono text-zinc-600">
            {new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            {report.geckoId && <span className="ml-3 text-zinc-700">CoinGecko · {report.geckoId}</span>}
            {report.llamaSlug && <span className="ml-2 text-zinc-700">· DefiLlama · {report.llamaSlug}</span>}
          </p>
          <div className="ml-auto flex items-center gap-4">
            {!editing && (
              <button onClick={() => { setEditing(true); setEditContent(report.content); }}
                className="text-xs font-mono text-zinc-600 hover:text-zinc-300 transition-colors">
                Edit raw
              </button>
            )}
            <button onClick={del} className="text-xs font-mono text-zinc-700 hover:text-red-400 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Live metrics table */}
      {hasMetrics && (
        <div className="mb-12">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 pb-2 border-b border-zinc-800/60">
            Current State
          </h2>
          <table className="w-full text-sm font-mono">
            <tbody>
              {METRIC_LABELS.filter(([k]) => report.metrics[k]).map(([k, label]) => (
                <tr key={k} className="border-b border-zinc-800/40">
                  <td className="py-2 pr-6 text-zinc-500 w-56">{label}</td>
                  <td className="py-2 text-zinc-200">{report.metrics[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report content */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            rows={40}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
          <div className="flex gap-3">
            <button onClick={saveEdit} disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-mono rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <ReportBody content={report.content} />
      )}

      <div className="mt-16 pt-6 border-t border-zinc-800">
        <p className="text-xs font-mono text-zinc-700">
          Alpha Terminal · {report.reportType} · {report.ticker} · {new Date(report.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
