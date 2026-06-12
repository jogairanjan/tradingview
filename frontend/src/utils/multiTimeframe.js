const TF_SECONDS = {
  '1s': 1,
  '5s': 5,
  '15s': 15,
  '30s': 30,
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '45m': 2700,
  '1H': 3600,
  '2H': 7200,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000,
};

export function getHigherTimeframe(tf) {
  const ladder = ['1s', '5s', '15s', '30s', '1m', '3m', '5m', '15m', '30m', '45m', '1H', '2H', '4H', '1D', '1W', '1M'];
  const idx = ladder.indexOf(tf);
  if (idx < 0 || idx >= ladder.length - 1) return tf;
  return ladder[Math.min(idx + 3, ladder.length - 1)];
}

export function aggregateCandles(data, targetTf) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const step = TF_SECONDS[targetTf] || 3600;
  const out = [];
  let bucket = null;

  for (const c of data) {
    const t = Math.floor(c.time / step) * step;
    if (!bucket || bucket.time !== t) {
      if (bucket) out.push(bucket);
      bucket = {
        time: t,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume ?? 0,
      };
    } else {
      bucket.high = Math.max(bucket.high, c.high);
      bucket.low = Math.min(bucket.low, c.low);
      bucket.close = c.close;
      bucket.volume += c.volume ?? 0;
    }
  }
  if (bucket) out.push(bucket);
  return out;
}

