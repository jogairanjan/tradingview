import { isSubMinuteTimeframe, snapCandleTime } from './chartTime';

/** Binance public WebSocket helpers for live klines & trades. */

const INTERVAL_MAP = {
  '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m', '45m': '30m',
  '1H': '1h', '1h': '1h', '2H': '2h', '2h': '2h',
  '4H': '4h', '4h': '4h', '1D': '1d', '1d': '1d', '1W': '1w', '1w': '1w', '1M': '1d',
};

export function toBinanceSymbol(symbol) {
  return String(symbol || 'BTC/USDT').replace('/', '').toLowerCase();
}

export function toBinanceInterval(timeframe) {
  if (isSubMinuteTimeframe(timeframe)) return null;
  return INTERVAL_MAP[timeframe] || '1h';
}

export function supportsKlineStream(timeframe) {
  if (isSubMinuteTimeframe(timeframe)) return false;
  const i = toBinanceInterval(timeframe);
  return Boolean(i && ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'].includes(i));
}

export function getKlineWsUrl(symbol, timeframe) {
  const s = toBinanceSymbol(symbol);
  const i = toBinanceInterval(timeframe);
  if (!i) throw new Error(`No Binance kline interval for ${timeframe}`);
  return `wss://stream.binance.com:9443/ws/${s}@kline_${i}`;
}

export function getTradeWsUrl(symbol) {
  const s = toBinanceSymbol(symbol);
  return `wss://stream.binance.com:9443/ws/${s}@trade`;
}

export function parseKlineMessage(raw, timeframe) {
  const k = raw?.k;
  if (!k) return null;
  const openMs = k.t;
  const unix = Math.floor(openMs / 1000);
  const time = timeframe ? snapCandleTime(unix, timeframe) : unix;
  return {
    time,
    open: parseFloat(k.o),
    high: parseFloat(k.h),
    low: parseFloat(k.l),
    close: parseFloat(k.c),
    volume: parseFloat(k.v),
    isClosed: !!k.x,
  };
}

export function parseTradeMessage(raw) {
  if (!raw?.p) return null;
  const price = parseFloat(raw.p);
  const qty = parseFloat(raw.q || 0);
  if (!Number.isFinite(price)) return null;
  return { price, qty, time: Math.floor((raw.T || raw.E || Date.now()) / 1000) };
}
