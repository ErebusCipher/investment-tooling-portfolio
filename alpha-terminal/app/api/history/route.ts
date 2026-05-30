import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const revalidate = 3600;

// Returns daily close prices for a list of tickers over a given range
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickersParam = searchParams.get("tickers") ?? "";
  const range = (searchParams.get("range") ?? "1y") as "6m" | "1y" | "3y";

  const tickers = tickersParam.split(",").map((t) => t.trim()).filter(Boolean);
  if (!tickers.length) return NextResponse.json({ error: "No tickers" }, { status: 400 });

  const endDate = new Date();
  const startDate = new Date();
  if (range === "6m") startDate.setMonth(startDate.getMonth() - 6);
  else if (range === "3y") startDate.setFullYear(startDate.getFullYear() - 3);
  else startDate.setFullYear(startDate.getFullYear() - 1);

  const results: Record<string, { date: string; close: number }[]> = {};

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      // BTC: use CoinGecko market_chart
      if (ticker === "BTC") {
        const days = range === "6m" ? 180 : range === "3y" ? 1095 : 365;
        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
            { next: { revalidate: 3600 } }
          );
          if (res.ok) {
            const data = await res.json();
            results["BTC"] = (data.prices as [number, number][]).map(([ts, price]) => ({
              date: new Date(ts).toISOString().split("T")[0],
              close: price,
            }));
          }
        } catch { /* skip */ }
        return;
      }

      // ETFs / stocks via yahoo-finance2
      try {
        const hist = await yahooFinance.historical(ticker, {
          period1: startDate.toISOString().split("T")[0],
          period2: endDate.toISOString().split("T")[0],
          interval: "1d",
        }) as { date: Date; close: number }[];
        results[ticker] = hist.map((d) => ({
          date: d.date.toISOString().split("T")[0],
          close: d.close,
        }));
      } catch { /* skip */ }
    })
  );

  return NextResponse.json(results);
}
