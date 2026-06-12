import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTicker } from '../store/slices/marketSlice';
import {
  getKlineWsUrl,
  getTradeWsUrl,
  parseKlineMessage,
  parseTradeMessage,
  supportsKlineStream,
} from '../utils/binanceStream';
import { mergeOhlcvBar, snapCandleTime } from '../utils/chartTime';

/**
 * Stream live OHLCV from Binance WebSocket and merge into historical bars.
 * Also patches the last candle when the watchlist ticker price changes.
 */
export function useLiveKline(symbol, timeframe, baseOhlcv = [], enabled = true) {
  const dispatch = useDispatch();
  const tickers = useSelector((s) => s.market.tickers);
  const tickerPrice = tickers.find((t) => t.symbol === symbol)?.price;

  const [ohlcv, setOhlcv] = useState(baseOhlcv);
  const [connected, setConnected] = useState(false);
  const ohlcvRef = useRef(baseOhlcv);
  const seedKeyRef = useRef('');

  const applyBars = useCallback((next) => {
    ohlcvRef.current = next;
    setOhlcv(next);

    const last = next[next.length - 1];
    if (!last) return;
    dispatch(updateTicker({
      symbol,
      price: last.close,
      change: next.length > 1 && next[0].open
        ? ((last.close - next[0].open) / next[0].open) * 100
        : 0,
    }));
  }, [dispatch, symbol]);

  const pushBar = useCallback((bar) => {
    const next = mergeOhlcvBar(ohlcvRef.current, bar, timeframe);
    applyBars(next);
  }, [applyBars, timeframe]);

  // Seed historical bars only when symbol/timeframe changes — not on every REST poll
  useEffect(() => {
    const seed = `${symbol}|${timeframe}`;
    if (!baseOhlcv?.length) return;

    if (seedKeyRef.current !== seed) {
      seedKeyRef.current = seed;
      applyBars(baseOhlcv);
      return;
    }

    const live = ohlcvRef.current;
    if (!live.length) {
      applyBars(baseOhlcv);
      return;
    }

    const liveLast = live[live.length - 1];
    const baseLast = baseOhlcv[baseOhlcv.length - 1];
    if (!baseLast) return;

    if (liveLast.time === baseLast.time) {
      applyBars([
        ...baseOhlcv.slice(0, -1),
        {
          ...baseLast,
          high: Math.max(baseLast.high, liveLast.high),
          low: Math.min(baseLast.low, liveLast.low),
          close: liveLast.close,
          volume: Math.max(baseLast.volume || 0, liveLast.volume || 0),
        },
      ]);
    } else if (liveLast.time > baseLast.time) {
      applyBars([...baseOhlcv, liveLast].slice(-500));
    }
  }, [symbol, timeframe, baseOhlcv, applyBars]);

  // WebSocket kline / trade stream
  useEffect(() => {
    if (!enabled || !symbol || !baseOhlcv?.length) {
      setConnected(false);
      return undefined;
    }

    let ws;
    let reconnectTimer;
    let closed = false;

    const connectKline = () => {
      ws = new WebSocket(getKlineWsUrl(symbol, timeframe));
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) reconnectTimer = setTimeout(connectKline, 3000);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (ev) => {
        try {
          const bar = parseKlineMessage(JSON.parse(ev.data), timeframe);
          if (bar) pushBar(bar);
        } catch {
          /* ignore */
        }
      };
    };

    const connectTrade = () => {
      ws = new WebSocket(getTradeWsUrl(symbol));
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!closed) reconnectTimer = setTimeout(connectTrade, 3000);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (ev) => {
        try {
          const trade = parseTradeMessage(JSON.parse(ev.data));
          if (!trade) return;
          const cur = ohlcvRef.current;
          if (!cur.length) return;

          const bucketTime = snapCandleTime(trade.time, timeframe);
          const last = cur[cur.length - 1];
          const lastBucket = last ? snapCandleTime(last.time, timeframe) : null;

          if (last && bucketTime === lastBucket) {
            pushBar({
              time: bucketTime,
              open: last.open,
              high: Math.max(last.high, trade.price),
              low: Math.min(last.low, trade.price),
              close: trade.price,
              volume: (last.volume || 0) + trade.qty,
            });
          } else {
            pushBar({
              time: bucketTime,
              open: trade.price,
              high: trade.price,
              low: trade.price,
              close: trade.price,
              volume: trade.qty,
            });
          }
        } catch {
          /* ignore */
        }
      };
    };

    if (supportsKlineStream(timeframe)) connectKline();
    else connectTrade();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      ws?.close();
      setConnected(false);
    };
  }, [symbol, timeframe, enabled, baseOhlcv.length, pushBar]);

  // Sync last candle with ticker price (REST poll / socket) — always, not only when WS is idle
  useEffect(() => {
    if (!enabled || tickerPrice == null || !ohlcvRef.current.length) return;

    const price = Number(tickerPrice);
    if (!Number.isFinite(price)) return;

    const last = ohlcvRef.current[ohlcvRef.current.length - 1];
    if (Math.abs(last.close - price) < 1e-8) return;

    pushBar({
      ...last,
      close: price,
      high: Math.max(last.high, price),
      low: Math.min(last.low, price),
    });
  }, [tickerPrice, enabled, pushBar]);

  return { ohlcv, connected };
}
