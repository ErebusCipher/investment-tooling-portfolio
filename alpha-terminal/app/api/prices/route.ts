import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tickersParam = searchParams.get("tickers");
  if (!tickersParam) return NextResponse.json({ error: "No tickers" }, { status: 400 });

  const tickers = tickersParam.split(",").map((t) => t.trim());
  const results: Record<string, { price: number; change1d: number; changePercent1d: number }> = {};

  // Fetch BTC via CoinGecko (yahoo-finance2 can be flaky for crypto)
  const cryptoTickers = tickers.filter((t) => t === "BTC");
  const equityTickers = tickers.filter((t) => t !== "BTC");

  await Promise.allSettled([
    // Equities + ETFs via yahoo-finance2
    ...equityTickers.map(async (ticker) => {
      try {
        const q = await yahooFinance.quote(ticker) as {
          regularMarketPrice?: number;
          regularMarketChange?: number;
          regularMarketChangePercent?: number;
        };
        results[ticker] = {
          price: q.regularMarketPrice ?? 0,
          change1d: q.regularMarketChange ?? 0,
          changePercent1d: q.regularMarketChangePercent ?? 0,
        };
      } catch {
        // Leave missing
      }
    }),

    // BTC via CoinGecko
    cryptoTickers.length > 0
      ? (async () => {
          try {
            const res = await fetch(
              "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
              { next: { revalidate: 60 } }
            );
            if (res.ok) {
              const data = await res.json();
              results["BTC"] = {
                price: data.bitcoin.usd,
                change1d: (data.bitcoin.usd * (data.bitcoin.usd_24h_change ?? 0)) / 100,
                changePercent1d: data.bitcoin.usd_24h_change ?? 0,
              };
            }
          } catch {
            // Leave missing
          }
        })()
      : Promise.resolve(),
  ]);

  return NextResponse.json(results);
}
