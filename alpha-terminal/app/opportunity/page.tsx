"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/Panel";

interface Theme {
  id: string;
  name: string;
  conviction: number;
  thesis: string;
  tickers: string[];
  entryThesis: string;
  exitThesis: string;
  riskCase: string;
}

interface YearData {
  macroRegime: string;
  themes: Theme[];
}

interface OppData {
  years: Record<string, YearData>;
}

const BLANK_THEME: Omit<Theme, "id"> = {
  name: "", conviction: 3, thesis: "", tickers: [],
  entryThesis: "", exitThesis: "", riskCase: "",
};

function Stars({ conviction, onChange }: { conviction: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange?.(n)}
          className={`text-lg ${n <= conviction ? "text-amber-400" : "text-zinc-700"} ${onChange ? "hover:text-amber-300 cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function OpportunityPage() {
  const [data, setData] = useState<OppData>({ years: {} });
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("2026");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_THEME);
  const [editingRegime, setEditingRegime] = useState(false);
  const [regimeDraft, setRegimeDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/opportunity")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const yearData: YearData = data.years[year] ?? { macroRegime: "", themes: [] };
  const years = ["2025", "2026", "2027"].filter((y) => data.years[y] || y === "2026");

  const post = async (body: object) => {
    await fetch("/api/opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, ...body }),
    });
    load();
  };

  const saveRegime = async () => {
    setSaving(true);
    await post({ action: "updateRegime", macroRegime: regimeDraft });
    setSaving(false);
    setEditingRegime(false);
  };

  const addTheme = async () => {
    if (!form.name) return;
    setSaving(true);
    await post({ action: "addTheme", theme: { ...form, tickers: form.tickers } });
    setSaving(false);
    setShowForm(false);
    setForm(BLANK_THEME);
  };

  const deleteTheme = async (id: string) => {
    await post({ action: "deleteTheme", themeId: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Opportunity Set</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Annual high-conviction regime trades — Druckenmiller framework</p>
        </div>
        <div className="flex gap-2">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1 rounded text-sm font-mono transition-colors ${year === y ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Macro regime */}
      <Panel title={`${year} Macro Regime`}>
        {editingRegime ? (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={regimeDraft}
              onChange={(e) => setRegimeDraft(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={saveRegime} disabled={saving}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-mono rounded disabled:opacity-40">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setEditingRegime(false)}
                className="px-4 py-1.5 bg-zinc-700 text-zinc-300 text-sm font-mono rounded hover:bg-zinc-600">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <p className="text-zinc-200 font-mono text-sm leading-relaxed flex-1">
              {yearData.macroRegime || <span className="text-zinc-600">No regime set yet.</span>}
            </p>
            <button
              onClick={() => { setRegimeDraft(yearData.macroRegime); setEditingRegime(true); }}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 shrink-0"
            >
              Edit
            </button>
          </div>
        )}
      </Panel>

      {/* Theme cards */}
      {loading ? (
        <p className="text-zinc-500 text-sm font-mono">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {yearData.themes.map((theme) => (
            <div key={theme.id} className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-mono font-semibold text-zinc-100">{theme.name}</h3>
                  {theme.tickers.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {theme.tickers.map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Stars conviction={theme.conviction} />
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{theme.thesis}</p>
              {(theme.entryThesis || theme.exitThesis || theme.riskCase) && (
                <div className="grid grid-cols-1 gap-2 text-xs font-mono border-t border-zinc-800 pt-3">
                  {theme.entryThesis && (
                    <div><span className="text-zinc-500">Entry: </span><span className="text-zinc-300">{theme.entryThesis}</span></div>
                  )}
                  {theme.exitThesis && (
                    <div><span className="text-zinc-500">Exit: </span><span className="text-zinc-300">{theme.exitThesis}</span></div>
                  )}
                  {theme.riskCase && (
                    <div><span className="text-red-500">Risk: </span><span className="text-zinc-300">{theme.riskCase}</span></div>
                  )}
                </div>
              )}
              <button onClick={() => deleteTheme(theme.id)} className="text-xs font-mono text-zinc-700 hover:text-red-500">
                Remove
              </button>
            </div>
          ))}

          {/* Add theme button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl border border-dashed border-zinc-700 bg-transparent p-5 text-zinc-600 hover:text-zinc-400 hover:border-zinc-500 transition-colors text-sm font-mono flex items-center justify-center gap-2"
          >
            + Add Theme
          </button>
        </div>
      )}

      {/* Add theme form */}
      {showForm && (
        <Panel title="New Theme">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-mono text-zinc-500 block mb-1">Theme Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Asian Equities Ex-China"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 block mb-1">Tickers (comma-separated)</label>
              <input type="text" placeholder="EWJ, EWY, ASEA"
                onChange={(e) => setForm({ ...form, tickers: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 block mb-2">Conviction</label>
              <Stars conviction={form.conviction} onChange={(n) => setForm({ ...form, conviction: n })} />
            </div>
            {[
              ["Thesis", "thesis"],
              ["Entry Thesis", "entryThesis"],
              ["Exit Thesis", "exitThesis"],
              ["Risk Case", "riskCase"],
            ].map(([label, field]) => (
              <div key={field} className="md:col-span-2">
                <label className="text-xs font-mono text-zinc-500 block mb-1">{label}</label>
                <textarea rows={2} value={(form as Record<string, string | number | string[]>)[field] as string}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addTheme} disabled={saving || !form.name}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded">
              {saving ? "Saving…" : "Save Theme"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-zinc-700 text-zinc-300 text-sm font-mono rounded hover:bg-zinc-600">
              Cancel
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}
