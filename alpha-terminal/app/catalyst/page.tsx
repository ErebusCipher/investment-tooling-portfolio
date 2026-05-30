"use client";

import { useEffect, useState } from "react";
import Panel from "@/components/Panel";

interface CatalystEvent {
  id: string;
  date: string;
  name: string;
  type: string;
  source?: string; // "macro" = read-only system event
  description: string;
  likelyReaction: string;
  contrarianReaction: string;
  preTrade: string;
  tradeDuring: string;
  exitCondition: string;
  riskCase: string;
}

const TYPES = ["Airdrop", "Unlock", "Upgrade", "Regulatory", "TradFi", "Macro", "Other"];
const TYPE_COLORS: Record<string, string> = {
  Airdrop: "bg-purple-900/40 text-purple-300",
  Unlock: "bg-red-900/40 text-red-300",
  Upgrade: "bg-blue-900/40 text-blue-300",
  Regulatory: "bg-orange-900/40 text-orange-300",
  TradFi: "bg-green-900/40 text-green-300",
  Macro: "bg-yellow-900/40 text-yellow-300",
  Other: "bg-zinc-800 text-zinc-300",
};

const BLANK: Omit<CatalystEvent, "id"> = {
  date: "", name: "", type: "Other", description: "",
  likelyReaction: "", contrarianReaction: "", preTrade: "",
  tradeDuring: "", exitCondition: "", riskCase: "",
};

function WarGameField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-mono text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm text-zinc-300 leading-relaxed">{value}</p>
    </div>
  );
}

export default function CatalystPage() {
  const [userEvents, setUserEvents] = useState<CatalystEvent[]>([]);
  const [macroEvents, setMacroEvents] = useState<CatalystEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      fetch("/api/catalysts").then((r) => r.json()),
      fetch("/api/macro-calendar").then((r) => r.json()),
    ]).then(([userRes, macroRes]) => {
      if (userRes.status === "fulfilled") setUserEvents(userRes.value?.events ?? []);
      if (macroRes.status === "fulfilled" && Array.isArray(macroRes.value)) setMacroEvents(macroRes.value);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.date) return;
    setSaving(true);
    await fetch("/api/catalysts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", event: form }),
    });
    setSaving(false);
    setShowForm(false);
    setForm(BLANK);
    load();
  };

  const del = async (id: string) => {
    await fetch("/api/catalysts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  };

  const now = new Date().toISOString().split("T")[0];

  // Merge and sort all events
  const allEvents = [...userEvents, ...macroEvents].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = allEvents.filter((e) => e.date >= now);
  const past = allEvents.filter((e) => e.date < now).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Catalyst Calendar</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Upcoming events · War-game playbooks · FOMC/CPI/NFP auto-loaded</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-mono rounded transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {/* Add event form */}
      {showForm && (
        <Panel title="New Event">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-zinc-500 block mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-500 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-mono text-zinc-500 block mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Pump.fun Airdrop"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-mono text-zinc-500 block mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            {[
              ["Likely Reaction", "likelyReaction"],
              ["Contrarian Reaction", "contrarianReaction"],
              ["Pre-Event Trade", "preTrade"],
              ["Trade During", "tradeDuring"],
              ["Exit Condition", "exitCondition"],
              ["Risk Case", "riskCase"],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="text-xs font-mono text-zinc-500 block mb-1">{label}</label>
                <textarea rows={2} value={(form as Record<string, string>)[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
            ))}
          </div>
          <button
            onClick={save}
            disabled={saving || !form.name || !form.date}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-mono rounded transition-colors"
          >
            {saving ? "Saving…" : "Save Event"}
          </button>
        </Panel>
      )}

      {/* Upcoming events */}
      {loading ? (
        <p className="text-zinc-500 text-sm font-mono">Loading…</p>
      ) : upcoming.length === 0 ? (
        <Panel><p className="text-zinc-500 text-sm font-mono">No upcoming events.</p></Panel>
      ) : (
        <div className="space-y-3">
          {upcoming.map((evt) => {
            const isMacro = evt.source === "macro";
            const isOpen = expanded === evt.id;
            return (
              <div
                key={evt.id}
                className={`rounded-xl border bg-zinc-900/30 ${isMacro ? "border-zinc-700/60" : "border-zinc-700"}`}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : evt.id)}
                >
                  <span className="font-mono text-sm text-zinc-400 w-24 shrink-0">{evt.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono shrink-0 ${TYPE_COLORS[evt.type] ?? TYPE_COLORS.Other}`}>{evt.type}</span>
                  {isMacro && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0 bg-zinc-800 text-zinc-500 border border-zinc-700">
                      auto
                    </span>
                  )}
                  <span className="font-mono text-sm text-zinc-200 flex-1">{evt.name}</span>
                  <span className="text-zinc-600 text-lg">{isOpen ? "↑" : "↓"}</span>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-4 space-y-3">
                    {evt.description && <p className="text-sm text-zinc-400 leading-relaxed">{evt.description}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <WarGameField label="Likely Reaction" value={evt.likelyReaction} />
                      <WarGameField label="Contrarian Reaction" value={evt.contrarianReaction} />
                      <WarGameField label="Pre-Event Trade" value={evt.preTrade} />
                      <WarGameField label="Trade During" value={evt.tradeDuring} />
                      <WarGameField label="Exit Condition" value={evt.exitCondition} />
                      <WarGameField label="Risk Case" value={evt.riskCase} />
                    </div>
                    {!isMacro && (
                      <button
                        onClick={() => del(evt.id)}
                        className="text-xs font-mono text-red-500 hover:text-red-400 mt-2"
                      >
                        Delete event
                      </button>
                    )}
                    {isMacro && (
                      <p className="text-xs font-mono text-zinc-600 mt-2">Auto-populated macro event — read only.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Past events toggle */}
      {past.length > 0 && (
        <div>
          <button
            onClick={() => setShowPast((v) => !v)}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPast ? "↑ Hide" : "↓ Show"} {past.length} past events
          </button>
          {showPast && (
            <div className="space-y-3 mt-3">
              {past.map((evt) => {
                const isMacro = evt.source === "macro";
                const isOpen = expanded === evt.id;
                return (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-zinc-800/40 bg-zinc-900/30 opacity-50"
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : evt.id)}
                    >
                      <span className="font-mono text-sm text-zinc-500 w-24 shrink-0">{evt.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono shrink-0 ${TYPE_COLORS[evt.type] ?? TYPE_COLORS.Other}`}>{evt.type}</span>
                      <span className="font-mono text-sm text-zinc-400 flex-1">{evt.name}</span>
                      <span className="text-zinc-600 text-lg">{isOpen ? "↑" : "↓"}</span>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-zinc-800 pt-4 space-y-3">
                        {evt.description && <p className="text-sm text-zinc-500 leading-relaxed">{evt.description}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <WarGameField label="Likely Reaction" value={evt.likelyReaction} />
                          <WarGameField label="Contrarian Reaction" value={evt.contrarianReaction} />
                          <WarGameField label="Pre-Event Trade" value={evt.preTrade} />
                          <WarGameField label="Trade During" value={evt.tradeDuring} />
                          <WarGameField label="Exit Condition" value={evt.exitCondition} />
                          <WarGameField label="Risk Case" value={evt.riskCase} />
                        </div>
                        {!isMacro && (
                          <button
                            onClick={() => del(evt.id)}
                            className="text-xs font-mono text-red-500 hover:text-red-400 mt-2"
                          >
                            Delete event
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
