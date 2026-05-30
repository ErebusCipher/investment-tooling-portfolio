import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("CoinGecko trending unavailable");
    const data = await res.json();

    const coins = (data.coins ?? []).map((c: {
      item: {
        symbol: string;
        name: string;
        market_cap_rank: number;
        data?: { price_change_percentage_24h?: { usd?: number }; price?: string };
      };
    }) => ({
      symbol: c.item.symbol.toUpperCase(),
      name: c.item.name,
      rank: c.item.market_cap_rank,
      change24h: c.item.data?.price_change_percentage_24h?.usd ?? null,
      price: c.item.data?.price ?? null,
    }));

    return NextResponse.json({ coins });
  } catch (err) {
    return NextResponse.json({ error: String(err), coins: [] }, { status: 500 });
  }
}
