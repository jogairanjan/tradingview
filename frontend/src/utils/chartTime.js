import { TIMEFRAMES } from './timeframes';

/** Candle interval length in seconds (Binance UTC-aligned). */
export function timeframeSeconds(timeframe = '1H') {
  const tf = TIMEFRAMES.find(
    (t) => t.id === timeframe || t.id.toLowerCase() === String(timeframe).toLowerCase()
  );
  return tf?.seconds || 3600;
}

/** Binance has no native klines below 1m — build these from agg trades. */
export function isSubMinuteTimeframe(timeframe) {
  const sec = timeframeSeconds(timeframe);
  return sec > 0 && sec < 60;
}

/** Snap unix seconds to Binance candle open (UTC boundary). */
export function snapCandleTime(unixSec, timeframe) {
  const sec = timeframeSeconds(timeframe);
  if (!Number.isFinite(unixSec)) return unixSec;

  if (sec >= 86400) {
    const d = new Date(unixSec * 1000);
    return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
  }
  return Math.floor(unixSec / sec) * sec;
}

/** Merge live bar into historical series with aligned candle times. */
export function mergeOhlcvBar(prev, bar, timeframe) {
  if (!bar) return prev || [];
  const aligned = {
    ...bar,
    time: snapCandleTime(bar.time, timeframe),
  };
  if (!prev?.length) return [aligned];

  const sec = timeframeSeconds(timeframe);
  const next = [...prev];
  const lastIdx = next.length - 1;
  const last = next[lastIdx];
  const lastOpen = snapCandleTime(last.time, timeframe);

  if (aligned.time === lastOpen) {
    next[lastIdx] = {
      ...last,
      ...aligned,
      time: lastOpen,
      open: last.open,
      high: Math.max(last.high, aligned.high ?? last.high),
      low: Math.min(last.low, aligned.low ?? last.low),
      close: aligned.close ?? last.close,
      volume: aligned.volume ?? last.volume,
    };
    return next;
  }

  if (aligned.time > lastOpen) {
    if (aligned.time - lastOpen < sec * 1.5) {
      next[lastIdx] = {
        ...last,
        ...aligned,
        time: lastOpen,
        open: last.open,
        high: Math.max(last.high, aligned.high ?? last.high),
        low: Math.min(last.low, aligned.low ?? last.low),
        close: aligned.close ?? last.close,
        volume: aligned.volume ?? last.volume,
      };
      return next;
    }
    next.push(aligned);
    if (next.length > 500) next.shift();
    return next;
  }

  const idx = next.findIndex((b) => snapCandleTime(b.time, timeframe) === aligned.time);
  if (idx >= 0) {
    next[idx] = { ...next[idx], ...aligned, time: aligned.time };
  }
  return next;
}

const timeSetFromOhlcv = (ohlcv) => new Set(ohlcv.map((b) => b.time));

function filterByTimes(series, times) {
  if (!Array.isArray(series) || !series.length) return series;
  return series.filter((p) => times.has(p.time));
}

/** Align Python indicator arrays to Binance OHLCV timestamps. */
export function alignIndicatorsToOhlcv(indicators, ohlcv) {
  if (!indicators || !ohlcv?.length) return indicators;
  const times = timeSetFromOhlcv(ohlcv);

  const align = (series) => filterByTimes(series, times);

  return {
    rsi: align(indicators.rsi),
    macd: indicators.macd
      ? {
          line: align(indicators.macd.line),
          signal: align(indicators.macd.signal),
          histogram: align(indicators.macd.histogram),
        }
      : null,
    bollinger: indicators.bollinger
      ? {
          upper: align(indicators.bollinger.upper),
          middle: align(indicators.bollinger.middle),
          lower: align(indicators.bollinger.lower),
        }
      : null,
    adx: align(indicators.adx),
    dmi: indicators.dmi
      ? {
          plus: align(indicators.dmi.plus),
          minus: align(indicators.dmi.minus),
        }
      : null,
  };
}

/** Lightweight-charts crosshair / axis time label (local timezone). */
export function formatChartTime(time, subMinute = false) {
  if (time == null) return '';
  const ts = typeof time === 'number' ? time * 1000 : time;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: subMinute ? '2-digit' : undefined,
    hour12: false,
  });
}
