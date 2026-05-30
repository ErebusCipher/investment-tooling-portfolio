import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const HISTORY_PATH = path.join(process.cwd(), "data", "btc-dominance-history.json");

type HistoryEntry = { date: string; btcDominance: number };

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function appendHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const hist = await readHistory();
  // Deduplicate by date — keep latest reading for today
  const filtered = hist.filter((h) => h.date !== entry.date);
  const updated = [...filtered, entry].slice(-30); // keep last 30 days
  await fs.writeFile(HISTORY_PATH, JSON.stringify(updated, null, 2));
  return updated;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeHistory = searchParams.get("history") === "30";

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global");
    if (!res.ok) throw new Error("CoinGecko unavailable");

    const json = await res.json();
    const data = json.data;

    const btcDominance: number = data.market_cap_percentage?.btc ?? null;

    let history: HistoryEntry[] = [];

    if (includeHistory && btcDominance !== null) {
      const today = new Date().toISOString().split("T")[0];
      history = await appendHistory({ date: today, btcDominance: +btcDominance.toFixed(2) });
    }

    return NextResponse.json({
      btcDominance,
      ethDominance: data.market_cap_percentage?.eth ?? null,
      totalMarketCap: data.total_market_cap?.usd ?? null,
      marketCapChange24h: data.market_cap_change_percentage_24h_usd ?? null,
      ...(includeHistory ? { history } : {}),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
