const { Op } = require('sequelize');
const { Signal, SignalHistory, TradingPair, Watchlist } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { generateSignal } = require('./pythonBridgeService');

const signalIncludes = [
  { model: TradingPair, as: 'tradingPair', attributes: ['id', 'symbol', 'base_asset', 'quote_asset'] },
];

const logHistory = async (signalId, eventType, message, price = null, metadata = null) =>
  SignalHistory.create({ signal_id: signalId, event_type: eventType, message, price, metadata });

const listSignals = async ({ page = 1, limit = 20, status, type, symbol }) => {
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const pairWhere = symbol ? { symbol: { [Op.like]: `%${symbol}%` } } : undefined;

  const offset = (page - 1) * limit;
  const { rows, count } = await Signal.findAndCountAll({
    where,
    include: [{ model: TradingPair, as: 'tradingPair', where: pairWhere, required: !!symbol }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  });

  return { rows, count, page: parseInt(page, 10), limit: parseInt(limit, 10) };
};

const getSignalById = async (id) => {
  const signal = await Signal.findByPk(id, {
    include: [...signalIncludes, { model: SignalHistory, as: 'history', order: [['created_at', 'DESC']] }],
  });
  if (!signal) throw new AppError('Signal not found', 404);
  return signal;
};

const createSignal = async (data, userId = null) => {
  const pair = await TradingPair.findByPk(data.tradingPairId);
  if (!pair) throw new AppError('Trading pair not found', 404);

  const signal = await Signal.create({
    trading_pair_id: data.tradingPairId,
    created_by: userId,
    type: data.type,
    entry_price: data.entryPrice,
    stop_loss: data.stopLoss,
    take_profit: data.takeProfit,
    take_profit_2: data.takeProfit2,
    confidence: data.confidence,
    timeframe: data.timeframe || '1h',
    source: data.source || 'manual',
    notes: data.notes,
  });

  await logHistory(signal.id, 'created', 'Signal created', data.entryPrice);
  return getSignalById(signal.id);
};

const updateSignal = async (id, data) => {
  const signal = await Signal.findByPk(id);
  if (!signal) throw new AppError('Signal not found', 404);

  await signal.update({
    type: data.type ?? signal.type,
    status: data.status ?? signal.status,
    entry_price: data.entryPrice ?? signal.entry_price,
    stop_loss: data.stopLoss ?? signal.stop_loss,
    take_profit: data.takeProfit ?? signal.take_profit,
    take_profit_2: data.takeProfit2 ?? signal.take_profit_2,
    confidence: data.confidence ?? signal.confidence,
    notes: data.notes ?? signal.notes,
    pnl_percent: data.pnlPercent ?? signal.pnl_percent,
    closed_at: data.status === 'closed' ? new Date() : signal.closed_at,
  });

  await logHistory(signal.id, 'updated', 'Signal updated');
  return getSignalById(signal.id);
};

const deleteSignal = async (id) => {
  const signal = await Signal.findByPk(id);
  if (!signal) throw new AppError('Signal not found', 404);
  await signal.destroy();
  return { message: 'Signal deleted' };
};

const getSignalHistory = async (signalId) => {
  const signal = await Signal.findByPk(signalId);
  if (!signal) throw new AppError('Signal not found', 404);
  return SignalHistory.findAll({
    where: { signal_id: signalId },
    order: [['created_at', 'DESC']],
  });
};

const getWatchlist = async (userId) =>
  Watchlist.findAll({
    where: { user_id: userId },
    include: [{ model: TradingPair, as: 'tradingPair' }],
    order: [['created_at', 'DESC']],
  });

const addToWatchlist = async (userId, tradingPairId) => {
  const pair = await TradingPair.findByPk(tradingPairId);
  if (!pair) throw new AppError('Trading pair not found', 404);

  const [item, created] = await Watchlist.findOrCreate({
    where: { user_id: userId, trading_pair_id: tradingPairId },
    defaults: { alerts_enabled: true },
  });

  if (!created) throw new AppError('Pair already in watchlist', 409);
  return item;
};

const removeFromWatchlist = async (userId, watchlistId) => {
  const item = await Watchlist.findOne({ where: { id: watchlistId, user_id: userId } });
  if (!item) throw new AppError('Watchlist item not found', 404);
  await item.destroy();
  return { message: 'Removed from watchlist' };
};

/**
 * Trigger Python bridge and persist generated signals.
 */
const generateSignalsFromPython = async (payload = {}) => {
  const result = await generateSignal(payload);
  const signals = result.signals || (result.signal ? [result.signal] : []);

  const created = [];
  for (const s of signals) {
    let pair = await TradingPair.findOne({ where: { symbol: s.symbol } });
    if (!pair) {
      const [base, quote] = (s.symbol || 'BTCUSDT').replace('/', '').match(/(.+)(USDT|USD|EUR)$/i) || [];
      pair = await TradingPair.create({
        symbol: s.symbol,
        base_asset: s.base_asset || base || 'BTC',
        quote_asset: s.quote_asset || quote || 'USDT',
      });
    }

    const signal = await createSignal(
      {
        tradingPairId: pair.id,
        type: s.type || s.action || 'buy',
        entryPrice: s.entry_price || s.price,
        stopLoss: s.stop_loss,
        takeProfit: s.take_profit,
        confidence: s.confidence,
        timeframe: s.timeframe,
        source: 'python',
        notes: s.notes,
      },
      null
    );
    created.push(signal);
  }

  return { generated: created.length, signals: created, raw: result };
};

module.exports = {
  listSignals,
  getSignalById,
  createSignal,
  updateSignal,
  deleteSignal,
  getSignalHistory,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  generateSignalsFromPython,
};
