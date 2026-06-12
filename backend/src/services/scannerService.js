const { Op } = require('sequelize');
const { TradingPair, Signal } = require('../models');

function scoreFromSymbol(symbol) {
  return symbol.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
}

function scoreSignal(signal) {
  if (!signal) return { type: 'WATCH', confidence: 50, rsi: 50 };
  const confidence = Number(signal.confidence ?? 60);
  if (signal.type === 'buy') return { type: 'BUY', confidence, rsi: Math.min(80, 45 + confidence / 2) };
  if (signal.type === 'sell') return { type: 'SELL', confidence, rsi: Math.max(20, 75 - confidence / 2) };
  return { type: 'WATCH', confidence, rsi: 50 };
}

async function runScanner({ query = '', limit = 100, market = 'all', preset = 'breakout' }) {
  const where = { is_active: true };
  if (query) where.symbol = { [Op.like]: `%${query.toUpperCase()}%` };

  const pairs = await TradingPair.findAll({
    where,
    order: [['symbol', 'ASC']],
    limit: Math.min(Number(limit) || 100, 500),
  });

  if (!pairs.length) return [];
  const pairIds = pairs.map((p) => p.id);

  const recentSignals = await Signal.findAll({
    where: { trading_pair_id: { [Op.in]: pairIds } },
    order: [['created_at', 'DESC']],
    limit: pairIds.length * 2,
  });

  const latestSignalByPair = new Map();
  recentSignals.forEach((s) => {
    if (!latestSignalByPair.has(s.trading_pair_id)) latestSignalByPair.set(s.trading_pair_id, s);
  });

  const results = pairs.map((pair) => {
    const baseScore = (scoreFromSymbol(pair.symbol) % 35) + 45;
    const signal = latestSignalByPair.get(pair.id);
    const derived = scoreSignal(signal);

    const presetBoost =
      preset === 'macd-rsi' ? 6 :
      preset === 'squeeze' ? 4 :
      preset === 'pattern' ? 8 : 5;

    const conviction = Math.max(1, Math.min(99, Math.round(baseScore + presetBoost + (derived.confidence - 50) * 0.35)));
    const change = Number((((scoreFromSymbol(pair.symbol) % 140) - 70) / 10).toFixed(2));

    return {
      symbol: pair.symbol,
      market: pair.exchange || market,
      conviction,
      rsi: Number(derived.rsi.toFixed(1)),
      change,
      pattern: conviction > 74 ? 'Double Bottom' : conviction < 35 ? 'Double Top' : '—',
      signal: derived.type === 'WATCH' ? (conviction > 65 ? 'BUY' : conviction < 40 ? 'SELL' : 'WATCH') : derived.type,
      confidence: Number(derived.confidence.toFixed(1)),
    };
  });

  return results.sort((a, b) => b.conviction - a.conviction);
}

module.exports = { runScanner };

