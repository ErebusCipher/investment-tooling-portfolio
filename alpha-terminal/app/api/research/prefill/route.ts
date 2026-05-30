import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function fmt(n: number, decimals = 0): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals === 0 ? 2 : decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals === 0 ? 1 : decimals)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const ticker = searchParams.get("ticker");

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    // ── Step 1: Find CoinGecko coin ID ──────────────────────────────────────
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    if (!searchRes.ok) throw new Error("CoinGecko search failed");
    const searchData = await searchRes.json();

    const coins: { id: string; symbol: string; name: string; market_cap_rank: number | null }[] =
      searchData.coins ?? [];

    // Prefer exact ticker match, then exact name match, then first result
    const tickerUpper = (ticker ?? "").toUpperCase();
    let coin =
      coins.find((c) => c.symbol.toUpperCase() === tickerUpper) ??
      coins.find((c) => c.name.toLowerCase() === query.toLowerCase()) ??
      coins[0];

    if (!coin) throw new Error(`No CoinGecko match found for "${query}"`);

    const geckoId = coin.id;

    // ── Step 2: Fetch CoinGecko coin detail ─────────────────────────────────
    const coinRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    if (!coinRes.ok) throw new Error(`CoinGecko coin detail failed for ${geckoId}`);
    const coinData = await coinRes.json();

    const md = coinData.market_data;
    const price = md.current_price?.usd ?? 0;
    const fdv = md.fully_diluted_valuation?.usd ?? 0;
    const marketCap = md.market_cap?.usd ?? 0;
    const ath = md.ath?.usd ?? 0;
    const athChangePct = md.ath_change_percentage?.usd ?? 0;
    const circulatingSupply = md.circulating_supply ?? 0;
    const totalSupply = md.total_supply ?? 0;

    // ── Step 3: Find DefiLlama slug via gecko_id cross-reference ────────────
    let llamaSlug: string | null = null;
    let dailyRevenueCurrent: number | null = null;
    let dailyRevenuePeak: number | null = null;
    let revenueHistory: string = "";
    let otherKpis = "";

    try {
      const llamaListRes = await fetch("https://api.llama.fi/protocols");
      if (llamaListRes.ok) {
        const llamaList: { slug: string; gecko_id?: string; name: string; tvl?: number; category?: string; chains?: string[] }[] =
          await llamaListRes.json();

        const match =
          llamaList.find((p) => p.gecko_id === geckoId) ??
          llamaList.find((p) => p.name.toLowerCase() === query.toLowerCase());

        if (match) {
          llamaSlug = match.slug;
          const tvlFormatted = match.tvl ? fmt(match.tvl) : null;
          const chainsStr = match.chains?.slice(0, 3).join(", ") ?? "";
          if (tvlFormatted) otherKpis += `TVL: ${tvlFormatted}`;
          if (chainsStr) otherKpis += (otherKpis ? " · " : "") + `Chains: ${chainsStr}`;
          if (match.category) otherKpis += (otherKpis ? " · " : "") + `Category: ${match.category}`;
        }
      }
    } catch { /* skip */ }

    // ── Step 4: Fetch DefiLlama fees / revenue data ──────────────────────────
    if (llamaSlug) {
      try {
        const feesRes = await fetch(
          `https://api.llama.fi/summary/fees/${llamaSlug}?dataType=dailyFees`
        );
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          const chart: [number, number][] = feesData.totalDataChart ?? [];

          if (chart.length > 0) {
            dailyRevenueCurrent = chart[chart.length - 1][1];
            const peakEntry = chart.reduce((a, b) => (b[1] > a[1] ? b : a));
            dailyRevenuePeak = peakEntry[1];

            // Build revenue history narrative for the form
            // Find monthly peaks by grouping
            const byMonth: Record<string, number> = {};
            for (const [ts, val] of chart) {
              const d = new Date(ts * 1000);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              if (!byMonth[key] || val > byMonth[key]) byMonth[key] = val;
            }
            const monthlyPeaks = Object.entries(byMonth)
              .sort()
              .slice(-12)
              .map(([month, peak]) => {
                const [y, m] = month.split("-");
                const monthName = new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
                return `${monthName}: ${fmt(peak * 30)}`;
              });

            revenueHistory = `Peak daily: ${fmt(dailyRevenuePeak)} on ${new Date(peakEntry[0] * 1000).toLocaleDateString("en", { month: "short", year: "numeric" })}. Current daily: ${fmt(dailyRevenueCurrent)}. Monthly revenue peaks (approx): ${monthlyPeaks.join(", ")}.`;
          }
        }
      } catch { /* skip */ }
    }

    // ── Step 5: Compute derived metrics ─────────────────────────────────────
    const revenueDrawdownPct = dailyRevenueCurrent && dailyRevenuePeak
      ? ((dailyRevenueCurrent - dailyRevenuePeak) / dailyRevenuePeak) * 100
      : null;
    const annualizedRevenue = dailyRevenueCurrent ? dailyRevenueCurrent * 365 : null;
    const forwardPS = annualizedRevenue && fdv ? fdv / annualizedRevenue : null;

    const floatPct = totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : null;

    return NextResponse.json({
      geckoId,
      llamaSlug,
      metrics: {
        price: price ? `~$${price < 1 ? price.toFixed(4) : price.toFixed(2)}` : "",
        fdv: fdv ? `~${fmt(fdv)}` : "",
        circMarketCap: marketCap ? `~${fmt(marketCap)}` : "",
        drawdownFromAth: athChangePct ? `${athChangePct.toFixed(1)}%` : "",
        dailyRevenueCurrent: dailyRevenueCurrent ? `~${fmt(dailyRevenueCurrent)}` : "",
        dailyRevenuePeak: dailyRevenuePeak ? `~${fmt(dailyRevenuePeak)}` : "",
        revenueDrawdown: revenueDrawdownPct ? `${pct(revenueDrawdownPct)}` : "",
        annualizedRevenue: annualizedRevenue ? `~${fmt(annualizedRevenue)}` : "",
        forwardPS: forwardPS ? `~${forwardPS.toFixed(0)}x` : "",
        otherKpis: [
          floatPct ? `Float: ${floatPct.toFixed(1)}% (${fmt(circulatingSupply, 0).replace("$", "")} / ${fmt(totalSupply, 0).replace("$", "")} total supply)` : "",
          otherKpis,
        ].filter(Boolean).join(" · "),
      },
      revenueHistory,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
