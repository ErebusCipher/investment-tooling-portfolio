export interface PriceSeries {
  date: string;
  close: number;
}

/** Normalise a price series to start at 1.0 (cumulative return) */
export function normaliseSeries(series: PriceSeries[]): { date: string; value: number }[] {
  if (!series.length) return [];
  const base = series[0].close;
  return series.map((d) => ({ date: d.date, value: d.close / base }));
}

/** Compute weighted portfolio cumulative return series.
 *  weights: { ticker -> weight (0-1) }, each weight proportion of portfolio.
 *  Aligns all series to common dates. */
export function weightedPortfolio(
  allSeries: Record<string, PriceSeries[]>,
  weights: Record<string, number>
): { date: string; value: number }[] {
  const tickers = Object.keys(weights);
  if (!tickers.length) return [];

  // Build date sets per ticker
  const dateSet = new Set<string>();
  for (const t of tickers) {
    const s = allSeries[t];
    if (s) s.forEach((d) => dateSet.add(d.date));
  }

  const dates = [...dateSet].sort();
  if (!dates.length) return [];

  // Index by date
  const indexed: Record<string, Record<string, number>> = {};
  for (const t of tickers) {
    indexed[t] = {};
    for (const d of allSeries[t] ?? []) indexed[t][d.date] = d.close;
  }

  // Find first date where all tickers have data
  const firstDate = dates.find((date) => tickers.every((t) => indexed[t][date] !== undefined));
  if (!firstDate) return [];

  // Base prices
  const basePrices: Record<string, number> = {};
  for (const t of tickers) basePrices[t] = indexed[t][firstDate];

  // Compute weighted cumulative return per date
  const result: { date: string; value: number }[] = [];
  let prevPrices = { ...basePrices };

  for (const date of dates) {
    if (date < firstDate) continue;
    let portfolioReturn = 0;
    let totalWeight = 0;
    for (const t of tickers) {
      const price = indexed[t][date];
      if (price !== undefined && basePrices[t]) {
        portfolioReturn += (weights[t] / basePrices[t]) * price;
        totalWeight += weights[t];
        prevPrices[t] = price;
      } else if (prevPrices[t] && basePrices[t]) {
        // Carry forward last known price
        portfolioReturn += (weights[t] / basePrices[t]) * prevPrices[t];
        totalWeight += weights[t];
      }
    }
    result.push({ date, value: totalWeight > 0 ? portfolioReturn / totalWeight : 1 });
  }

  return result;
}

/** Max drawdown from a cumulative return series */
export function maxDrawdown(series: { value: number }[]): number {
  if (!series.length) return 0;
  let peak = -Infinity;
  let maxDD = 0;
  for (const { value } of series) {
    if (value > peak) peak = value;
    const dd = (peak - value) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

/** Pearson correlation between two same-length arrays */
export function pearsonCorr(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = a.slice(0, n).reduce((s, x) => s + x, 0) / n;
  const meanB = b.slice(0, n).reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - meanA) * (b[i] - meanB);
    da += (a[i] - meanA) ** 2;
    db += (b[i] - meanB) ** 2;
  }
  return da * db === 0 ? 0 : num / Math.sqrt(da * db);
}

/** Build correlation matrix from daily return series */
export function correlationMatrix(
  allSeries: Record<string, PriceSeries[]>
): { tickers: string[]; matrix: number[][] } {
  const tickers = Object.keys(allSeries);
  // Compute daily log returns per ticker, align by date
  const returns: Record<string, { date: string; ret: number }[]> = {};
  for (const t of tickers) {
    const s = allSeries[t];
    returns[t] = s
      .slice(1)
      .map((d, i) => ({ date: d.date, ret: Math.log(d.close / s[i].close) }));
  }

  // Align dates
  const dateSet = new Set<string>();
  tickers.forEach((t) => returns[t].forEach((d) => dateSet.add(d.date)));
  const dates = [...dateSet].sort();

  const retByDate: Record<string, Record<string, number>> = {};
  for (const t of tickers) {
    for (const d of returns[t]) {
      if (!retByDate[d.date]) retByDate[d.date] = {};
      retByDate[d.date][t] = d.ret;
    }
  }

  const retArrays: Record<string, number[]> = {};
  for (const t of tickers) retArrays[t] = [];
  for (const date of dates) {
    if (tickers.every((t) => retByDate[date]?.[t] !== undefined)) {
      for (const t of tickers) retArrays[t].push(retByDate[date][t]);
    }
  }

  const matrix = tickers.map((a) =>
    tickers.map((b) => (a === b ? 1 : pearsonCorr(retArrays[a], retArrays[b])))
  );

  return { tickers, matrix };
}

export function fmtPct(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(decimals)}%`;
}
