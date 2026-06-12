/**
 * Support & resistance zone detection
 */

export function detectSRZones(data, lookback = 50, touchThreshold = 0.005) {
  if (!data?.length) return [];
  const slice = data.slice(-lookback);
  const prices = slice.flatMap((b) => [b.high, b.low, b.close]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const buckets = 20;
  const step = (max - min) / buckets || 1;
  const histogram = Array(buckets).fill(0);

  slice.forEach((bar) => {
    [bar.high, bar.low, bar.close].forEach((p) => {
      const idx = Math.min(buckets - 1, Math.floor((p - min) / step));
      histogram[idx]++;
    });
  });

  const zones = [];
  histogram.forEach((count, i) => {
    if (count >= 3) {
      const priceLow = min + i * step;
      const priceHigh = priceLow + step;
      const mid = (priceLow + priceHigh) / 2;
      const touches = slice.filter(
        (b) => Math.abs(b.high - mid) / mid < touchThreshold || Math.abs(b.low - mid) / mid < touchThreshold
      ).length;
      zones.push({
        id: `sr-${i}`,
        priceLow,
        priceHigh,
        mid,
        strength: Math.min(100, touches * 15 + count * 5),
        touches,
        type: mid > slice[slice.length - 1].close ? 'resistance' : 'support',
      });
    }
  });

  return zones.sort((a, b) => b.strength - a.strength).slice(0, 8);
}
