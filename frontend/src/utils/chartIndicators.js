/** Technical indicator calculations for lightweight-charts overlays */

export function calcSMA(data, period) {
  const out = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    out.push({ time: data[i].time, value: sum / period });
  }
  return out;
}

export function calcEMA(data, period) {
  const k = 2 / (period + 1);
  const out = [];
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
  out.push({ time: data[period - 1].time, value: ema });
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    out.push({ time: data[i].time, value: ema });
  }
  return out;
}

export function calcRSI(data, period = 14) {
  const out = [];
  if (data.length < period + 1) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out.push({ time: data[period].time, value: 100 - 100 / (1 + rs) });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    out.push({ time: data[i].time, value: rsi });
  }
  return out;
}

export function calcMACD(data, fast = 12, slow = 26, signal = 9) {
  const ema = (arr, p) => {
    const k = 2 / (p + 1);
    let v = arr[0].close;
    return arr.map((d, i) => {
      if (i === 0) return { time: d.time, value: v };
      v = d.close * k + v * (1 - k);
      return { time: d.time, value: v };
    });
  };
  const fastE = ema(data, fast);
  const slowE = ema(data, slow);
  const macdLine = fastE.map((f, i) => ({
    time: f.time,
    value: f.value - slowE[i].value,
  }));
  const signalLine = ema(
    macdLine.map((m) => ({ time: m.time, close: m.value })),
    signal
  );
  const histogram = macdLine.map((m, i) => ({
    time: m.time,
    value: m.value - (signalLine[i]?.value ?? 0),
    color: m.value >= (signalLine[i]?.value ?? 0) ? '#26a69a' : '#ef5350',
  }));
  return { macdLine, signalLine, histogram };
}

export const DEFAULT_INDICATORS = {
  sma20: true,
  sma50: false,
  ema20: false,
  ema50: false,
  rsi: true,
  macd: true,
  volume: true,
  bollinger: true,
  adx: false,
  dmi: false,
};

export const DEFAULT_CHART_SETTINGS = {
  gridVisible: true,
  showVolume: true,
  upColor: '#26a69a',
  downColor: '#ef5350',
  backgroundColor: '#131722',
  crosshair: true,
};
