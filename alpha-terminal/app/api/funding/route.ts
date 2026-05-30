import { NextResponse } from "next/server";

export const revalidate = 60;

const SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "AVAX", "LINK", "AAVE", "UNI", "DOGE"];

export async function GET() {
  try {
    const [bybitRes, binanceRes] = await Promise.allSettled([
      fetch("https://api.bybit.com/v5/market/tickers?category=linear", { next: { revalidate: 60 } }),
      fetch("https://fapi.binance.com/fapi/v1/premiumIndex", { next: { revalidate: 60 } }),
    ]);

    const bybitMap: Record<string, number> = {};
    if (bybitRes.status === "fulfilled" && bybitRes.value.ok) {
      const data: { retCode: number; result?: { list: { symbol: string; fundingRate?: string }[] } } =
        await bybitRes.value.json();
      for (const item of data.result?.list ?? []) {
        if (item.symbol.endsWith("USDT")) {
          const rate = parseFloat(item.fundingRate ?? "0");
          if (!isNaN(rate)) bybitMap[item.symbol.replace("USDT", "")] = rate * 3 * 365 * 100;
        }
      }
    }

    const binanceMap: Record<string, number> = {};
    if (binanceRes.status === "fulfilled" && binanceRes.value.ok) {
      const data: { symbol: string; lastFundingRate: string }[] = await binanceRes.value.json();
      for (const item of data) {
        if (item.symbol.endsWith("USDT")) {
          const rate = parseFloat(item.lastFundingRate ?? "0");
          if (!isNaN(rate)) binanceMap[item.symbol.replace("USDT", "")] = rate * 3 * 365 * 100;
        }
      }
    }

    const result = SYMBOLS.map((sym) => ({
      symbol: sym,
      bybit: bybitMap[sym] ?? null,
      binance: binanceMap[sym] ?? null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
