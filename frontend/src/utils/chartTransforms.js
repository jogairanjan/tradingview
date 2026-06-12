/**
 * Transform OHLC data for different chart types
 */

/** Normalize API/mock OHLCV for lightweight-charts (unix seconds, sorted, unique). */
export function normalizeOhlcv(data) {
  if (!Array.isArray(data) || !data.length) return [];
  const byTime = new Map();
  for (const bar of data) {
    let time = Number(bar.time);
    if (!Number.isFinite(time)) continue;
    if (time > 1e12) time = Math.floor(time / 1000);
    const open = Number(bar.open);
    const high = Number(bar.high);
    const low = Number(bar.low);
    const close = Number(bar.close);
    if (![open, high, low, close].every(Number.isFinite)) continue;
    byTime.set(time, {
      time,
      open,
      high: Math.max(high, open, close, low),
      low: Math.min(low, open, close, high),
      close,
      volume: Number(bar.volume ?? 0),
    });
  }
  return [...byTime.values()].sort((a, b) => a.time - b.time);
}

export function toHeikinAshi(data) {
  const out = [];
  let prevHa = null;
  for (const bar of data) {
    const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
    const haOpen = prevHa ? (prevHa.open + prevHa.close) / 2 : (bar.open + bar.close) / 2;
    const haHigh = Math.max(bar.high, haOpen, haClose);
    const haLow = Math.min(bar.low, haOpen, haClose);
    const ha = { time: bar.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    out.push(ha);
    prevHa = ha;
  }
  return out;
}

export function toHollowCandles(data) {
  return data.map((bar) => ({
    ...bar,
    hollow: bar.close >= bar.open,
  }));
}

export function toBaseline(data, basePrice) {
  const base = basePrice ?? data[Math.floor(data.length / 2)]?.close ?? 0;
  return data.map((bar) => ({
    time: bar.time,
    value: bar.close - base,
    base,
  }));
}

export function transformChartData(data, chartType) {
  if (!data?.length) return data;
  switch (chartType) {
    case 'heikin':
      return toHeikinAshi(data);
    case 'hollow':
      return toHollowCandles(data);
    case 'baseline': {
      const base = data[0]?.close;
      return toBaseline(data, base);
    }
    default:
      return data;
  }
}
