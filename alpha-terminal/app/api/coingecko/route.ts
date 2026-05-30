import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const [page1, page2] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d",
        { next: { revalidate: 300 } }
      ).then((r) => (r.ok ? r.json() : [])),
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=2&sparkline=false&price_change_percentage=7d",
        { next: { revalidate: 300 } }
      ).then((r) => (r.ok ? r.json() : [])),
    ]);

    const STABLES = new Set(["usdt","usdc","dai","busd","tusd","usdp","fdusd","usde","pyusd","usds"]);
    const WRAPPED = new Set(["wbtc","weth","wbnb","steth","wsteth","cbbtc","reth","weeth"]);

    const coins = [...page1, ...page2]
      .filter((c: { id: string }) => !STABLES.has(c.id) && !WRAPPED.has(c.id))
      .map((c: {
        symbol: string;
        name: string;
        market_cap: number;
        fully_diluted_valuation: number;
        current_price: number;
        price_change_percentage_7d_in_currency: number;
      }) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        marketCap: c.market_cap,
        fdv: c.fully_diluted_valuation,
        price: c.current_price,
        change7d: c.price_change_percentage_7d_in_currency,
        // Float ratio: marketCap / fdv  (low = low float)
        floatRatio: c.fully_diluted_valuation > 0 ? c.market_cap / c.fully_diluted_valuation : 1,
      }));

    return NextResponse.json(coins);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
