import { toBinanceSymbol } from './binanceStream';
import { snapCandleTime, timeframeSeconds } from './chartTime';

const REST = 'https://api.binance.com/api/v3';

function aggregateTradesToBars(trades, timeframe) {
  const map = new Map();
  const sorted = [...trades].sort((a, b) => a.T - b.T);

  for (const t of sorted) {
    const unix = Math.floor(t.T / 1000);
    const time = snapCandleTime(unix, timeframe);
    const price = parseFloat(t.p);
    const qty = parseFloat(t.q);
    if (!Number.isFinite(price)) continue;

    const bar = map.get(time);
    if (!bar) {
      map.set(time, { time, open: price, high: price, low: price, close: price, volume: qty });
    } else {
      bar.high = Math.max(bar.high, price);
      bar.low = Math.min(bar.low, price);
      bar.close = price;
      bar.volume += qty;
    }
  }

  return [...map.values()].sort((a, b) => a.time - b.time);
}

/**
 * Build sub-minute OHLCV from Binance aggregate trades (1s / 5s / 15s / 30s).
 */
export async function fetchAggTradeCandles(symbol, timeframe, barCount = 200) {
  const pair = toBinanceSymbol(symbol).toUpperCase();
  const sec = timeframeSeconds(timeframe);
  const endTime = Date.now();
  const startTime = endTime - barCount * sec * 1000;

  const allTrades = [];
  let fromId = null;

  for (let page = 0; page < 60; page += 1) {
    const params = new URLSearchParams({ symbol: pair, limit: '1000' });
    if (fromId != null) {
      params.set('fromId', String(fromId));
    } else {
      params.set('startTime', String(startTime));
      params.set('endTime', String(endTime));
    }

    const res = await fetch(`${REST}/aggTrades?${params}`);
    if (!res.ok) throw new Error(`Binance aggTrades ${res.status}`);

    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;

    for (const t of batch) {
      if (t.T >= startTime && t.T <= endTime) allTrades.push(t);
    }

    const last = batch[batch.length - 1];
    if (batch.length < 1000 || last.T >= endTime) break;
    fromId = last.a + 1;
    if (allTrades.length > 0 && allTrades[0].T <= startTime) break;
  }

  const bars = aggregateTradesToBars(allTrades, timeframe);
  return bars.slice(-barCount);
}
