const axios = require('axios');
const logger = require('../utils/logger');
const pythonBridgeService = require('./pythonBridgeService');

const BINANCE_API = 'https://api.binance.com/api/v3';

const DEFAULT_SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT',
  'XRP/USDT', 'ADA/USDT', 'AVAX/USDT', 'DOT/USDT',
];

const toBinanceSymbol = (symbol) => String(symbol).replace('/', '').toUpperCase();

const formatVolume = (vol) => {
  const v = parseFloat(vol);
  if (!Number.isFinite(v)) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${Math.round(v / 1e6)}M`;
  return v.toLocaleString();
};

/**
 * Fetch tickers from Binance public API (no Python required).
 */
const fetchTickersFromBinance = async (symbols = DEFAULT_SYMBOLS) => {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const pair = toBinanceSymbol(symbol);
      try {
        const { data } = await axios.get(`${BINANCE_API}/ticker/24hr`, {
          params: { symbol: pair },
          timeout: 8000,
        });
        const price = parseFloat(data.lastPrice);
        const open = parseFloat(data.openPrice);
        const change = open ? ((price - open) / open) * 100 : parseFloat(data.priceChangePercent);
        return {
          symbol: symbol.includes('/') ? symbol : `${pair.slice(0, -4)}/USDT`,
          price,
          change: Math.round(change * 100) / 100,
          open,
          high: parseFloat(data.highPrice),
          low: parseFloat(data.lowPrice),
          volume: formatVolume(data.quoteVolume),
          source: 'binance',
        };
      } catch (err) {
        logger.debug(`Binance ticker failed for ${symbol}: ${err.message}`);
        return null;
      }
    })
  );
  return results.filter(Boolean);
};

/**
 * Live tickers: Python/ccxt first, then Binance REST fallback.
 */
const getTickers = async (symbols = DEFAULT_SYMBOLS) => {
  const healthy = await pythonBridgeService.checkHealth();
  if (healthy) {
    try {
      const tickers = await pythonBridgeService.fetchTickers(symbols);
      if (Array.isArray(tickers) && tickers.length) {
        return tickers.map((t) => ({ ...t, source: t.source || 'python-ta' }));
      }
    } catch (err) {
      logger.warn(`Python tickers unavailable, using Binance fallback: ${err.message}`);
    }
  }

  const fallback = await fetchTickersFromBinance(symbols);
  if (!fallback.length) {
    throw new Error('Ticker service unavailable (Python engine offline and Binance unreachable)');
  }
  return fallback;
};

module.exports = { getTickers, DEFAULT_SYMBOLS, fetchTickersFromBinance };
