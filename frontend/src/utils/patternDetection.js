/**
 * Swing detection, auto trendlines, and chart pattern recognition
 */

export function findSwingPoints(data, left = 3, right = 3) {
  const swings = [];
  for (let i = left; i < data.length - right; i++) {
    const slice = data.slice(i - left, i + right + 1);
    const high = data[i].high;
    const low = data[i].low;
    const isHigh = slice.every((b, j) => j === left || b.high <= high);
    const isLow = slice.every((b, j) => j === left || b.low >= low);
    if (isHigh) swings.push({ index: i, time: data[i].time, price: high, type: 'high' });
    if (isLow) swings.push({ index: i, time: data[i].time, price: low, type: 'low' });
  }
  return swings;
}

export function detectTrendlines(data, sensitivity = 3) {
  const swings = findSwingPoints(data, sensitivity, sensitivity);
  const highs = swings.filter((s) => s.type === 'high').slice(-6);
  const lows = swings.filter((s) => s.type === 'low').slice(-6);
  const lines = [];

  if (highs.length >= 2) {
    const a = highs[highs.length - 2];
    const b = highs[highs.length - 1];
    lines.push({
      id: `tl-res-${a.time}`,
      type: 'trendline',
      role: 'resistance',
      points: [{ time: a.time, price: a.price }, { time: b.time, price: b.price }],
      strength: 0.7,
      color: '#ef5350',
    });
  }
  if (lows.length >= 2) {
    const a = lows[lows.length - 2];
    const b = lows[lows.length - 1];
    lines.push({
      id: `tl-sup-${a.time}`,
      type: 'trendline',
      role: 'support',
      points: [{ time: a.time, price: a.price }, { time: b.time, price: b.price }],
      strength: 0.75,
      color: '#26a69a',
    });
  }
  return lines;
}

export function detectDoubleTopBottom(data) {
  const swings = findSwingPoints(data, 5, 5);
  const patterns = [];
  const highs = swings.filter((s) => s.type === 'high');
  const lows = swings.filter((s) => s.type === 'low');

  if (highs.length >= 2) {
    const h1 = highs[highs.length - 2];
    const h2 = highs[highs.length - 1];
    const diff = Math.abs(h1.price - h2.price) / h1.price;
    if (diff < 0.02) {
      patterns.push({
        id: 'double-top',
        name: 'Double Top',
        type: 'bearish',
        confidence: Math.round((1 - diff * 50) * 100),
        points: [h1, h2],
        breakoutProbability: 0.62,
      });
    }
  }
  if (lows.length >= 2) {
    const l1 = lows[lows.length - 2];
    const l2 = lows[lows.length - 1];
    const diff = Math.abs(l1.price - l2.price) / l1.price;
    if (diff < 0.02) {
      patterns.push({
        id: 'double-bottom',
        name: 'Double Bottom',
        type: 'bullish',
        confidence: Math.round((1 - diff * 50) * 100),
        points: [l1, l2],
        breakoutProbability: 0.65,
      });
    }
  }
  return patterns;
}

export function detectHeadAndShoulders(data) {
  const swings = findSwingPoints(data, 4, 4);
  const highs = swings.filter((s) => s.type === 'high');
  if (highs.length < 3) return null;
  const [left, head, right] = highs.slice(-3);
  if (head.price > left.price && head.price > right.price) {
    const shoulderDiff = Math.abs(left.price - right.price) / left.price;
    if (shoulderDiff < 0.03) {
      return {
        id: 'hns',
        name: 'Head & Shoulders',
        type: 'bearish',
        confidence: Math.round(75 - shoulderDiff * 500),
        points: [left, head, right],
        breakoutProbability: 0.58,
      };
    }
  }
  return null;
}

export function runPatternScan(data) {
  const patterns = [
    ...detectDoubleTopBottom(data),
  ];
  const hns = detectHeadAndShoulders(data);
  if (hns) patterns.push(hns);
  return patterns;
}
