import { NextResponse } from "next/server";

export const revalidate = 300;

interface LiqBucket {
  hour: string;        // "HH:00"
  longLiq: number;     // USD wiped from longs (positive number)
  shortLiq: number;    // USD wiped from shorts (positive number)
  oiUsd: number;
  price: number;
}

export async function GET() {
  try {
    const [oiRes, klinesRes] = await Promise.all([
      fetch(
        "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1h&limit=48",
        { next: { revalidate: 300 } }
      ),
      fetch(
        "https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=49",
        { next: { revalidate: 300 } }
      ),
    ]);

    if (!oiRes.ok || !klinesRes.ok) throw new Error("Binance unavailable");

    const oiData: { sumOpenInterestValue: string; timestamp: number }[] = await oiRes.json();
    const klines: [number, string, string, string, string, ...unknown[]][] = await klinesRes.json();

    // Build price map: openTime -> close price
    const priceMap = new Map<number, number>();
    for (const k of klines) {
      priceMap.set(k[0], parseFloat(k[4]));
    }

    const buckets: LiqBucket[] = [];

    for (let i = 1; i < oiData.length; i++) {
      const curr = oiData[i];
      const prev = oiData[i - 1];

      const currOi = parseFloat(curr.sumOpenInterestValue);
      const prevOi = parseFloat(prev.sumOpenInterestValue);
      const oiChange = currOi - prevOi; // positive = new positions, negative = closed/liquidated

      const currPrice = priceMap.get(curr.timestamp) ?? 0;
      const prevPrice = priceMap.get(prev.timestamp) ?? 0;
      const priceChange = currPrice - prevPrice;

      // OI drop paired with price direction → infer which side was liquidated
      // OI drop + price drop  → long liquidations (longs forced out)
      // OI drop + price rise  → short liquidations (shorts forced out)
      const oiDrop = oiChange < 0 ? Math.abs(oiChange) : 0;
      const longLiq = oiDrop > 0 && priceChange < 0 ? oiDrop : 0;
      const shortLiq = oiDrop > 0 && priceChange > 0 ? oiDrop : 0;

      const d = new Date(curr.timestamp);
      const hour = `${d.getUTCHours().toString().padStart(2, "0")}:00`;

      buckets.push({
        hour,
        longLiq: Math.round(longLiq / 1e6 * 10) / 10,    // $M, 1dp
        shortLiq: Math.round(shortLiq / 1e6 * 10) / 10,
        oiUsd: Math.round(currOi / 1e9 * 100) / 100,     // $B, 2dp
        price: Math.round(currPrice),
      });
    }

    // Signal: what happened in the most recent 6 hours
    const recent = buckets.slice(-6);
    const totalLongLiq = recent.reduce((s, b) => s + b.longLiq, 0);
    const totalShortLiq = recent.reduce((s, b) => s + b.shortLiq, 0);

    let signal: string;
    let signalType: "bullish" | "bearish" | "neutral";
    if (totalLongLiq > 50) {
      signal = `$${totalLongLiq.toFixed(0)}M in estimated long liquidations last 6h. Heavy long flush — watch for relief bounce.`;
      signalType = "bullish"; // contrarian: oversold longs = potential bottom
    } else if (totalShortLiq > 50) {
      signal = `$${totalShortLiq.toFixed(0)}M in estimated short liquidations last 6h. Short squeeze in progress — momentum up but watch for exhaustion.`;
      signalType = "bearish"; // contrarian: oversold shorts = potential top
    } else {
      signal = "No significant liquidation pressure in the last 6 hours.";
      signalType = "neutral";
    }

    return NextResponse.json({ buckets, signal, signalType });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
