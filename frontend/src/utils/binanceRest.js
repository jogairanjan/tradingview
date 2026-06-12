import { toBinanceInterval, toBinanceSymbol } from './binanceStream';
import { fetchAggTradeCandles } from './binanceAggTrades';
import { isSubMinuteTimeframe, snapCandleTime } from './chartTime';

const REST = 'https://api.binance.com/api/v3';

/**
 * Fetch historical klines from Binance (same time alignment as live WebSocket).
 */
export async function fetchBinanceKlines(symbol, timeframe, limit = 200) {
  if (isSubMinuteTimeframe(timeframe)) {
    return fetchAggTradeCandles(symbol, timeframe, limit);
  }

  const pair = toBinanceSymbol(symbol).toUpperCase();
  const interval = toBinanceInterval(timeframe);
  const url = `${REST}/klines?symbol=${pair}&interval=${interval}&limit=${Math.min(limit, 1000)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance klines ${res.status}`);

  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error('Invalid klines response');

  return rows.map((k) => {
    const time = snapCandleTime(Math.floor(k[0] / 1000), timeframe);
    return {
      time,
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    };
  });
}
