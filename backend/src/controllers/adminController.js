const { Op } = require('sequelize');
const {
  User,
  Signal,
  Subscription,
  Payment,
  TradingPair,
  Notification,
  AdminLog,
  Setting,
} = require('../models');
const signalService = require('../services/signalService');
const paymentService = require('../services/paymentService');
const apiResponse = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const logAdminAction = async (adminId, action, entityType, entityId, details, ip) =>
  AdminLog.create({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: ip,
  });

// --- Dashboard ---
const dashboard = async (req, res, next) => {
  try {
    const [users, signals, activeSubs, revenue, recentSignals] = await Promise.all([
      User.count(),
      Signal.count(),
      Subscription.count({ where: { status: 'active' } }),
      Payment.sum('amount', { where: { status: 'completed' } }),
      Signal.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [{ association: 'tradingPair', attributes: ['symbol'] }],
      }),
    ]);

    return apiResponse.success(res, {
      stats: {
        totalUsers: users,
        totalSignals: signals,
        activeSubscriptions: activeSubs,
        totalRevenue: revenue || 0,
      },
      recentSignals,
    });
  } catch (err) {
    next(err);
  }
};

// --- Users ---
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token', 'otp_code', 'reset_token'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    return apiResponse.paginated(res, { rows, count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    const { isActive, role, isVerified } = req.body;
    await user.update({
      is_active: isActive ?? user.is_active,
      role: role ?? user.role,
      is_verified: isVerified ?? user.is_verified,
    });

    await logAdminAction(req.user.id, 'update_user', 'user', user.id, req.body, req.ip);
    return apiResponse.success(res, user, 'User updated');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete admin user', 403);

    await user.destroy();
    await logAdminAction(req.user.id, 'delete_user', 'user', req.params.id, null, req.ip);
    return apiResponse.success(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

// --- Signals ---
const listSignals = async (req, res, next) => {
  try {
    const result = await signalService.listSignals(req.query);
    return apiResponse.paginated(res, result);
  } catch (err) {
    next(err);
  }
};

const createSignal = async (req, res, next) => {
  try {
    const signal = await signalService.createSignal(req.body, req.user.id);
    await logAdminAction(req.user.id, 'create_signal', 'signal', signal.id, null, req.ip);
    return apiResponse.created(res, signal);
  } catch (err) {
    next(err);
  }
};

const updateSignal = async (req, res, next) => {
  try {
    const signal = await signalService.updateSignal(req.params.id, req.body);
    await logAdminAction(req.user.id, 'update_signal', 'signal', signal.id, null, req.ip);
    return apiResponse.success(res, signal);
  } catch (err) {
    next(err);
  }
};

const deleteSignal = async (req, res, next) => {
  try {
    await signalService.deleteSignal(req.params.id);
    await logAdminAction(req.user.id, 'delete_signal', 'signal', req.params.id, null, req.ip);
    return apiResponse.success(res, null, 'Signal deleted');
  } catch (err) {
    next(err);
  }
};

// --- Subscriptions ---
const listSubscriptions = async (req, res, next) => {
  try {
    const result = await paymentService.listSubscriptions(req.query);
    return apiResponse.paginated(res, {
      rows: result.rows,
      count: result.count,
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
    });
  } catch (err) {
    next(err);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const sub = await paymentService.createSubscription(req.body);
    await logAdminAction(req.user.id, 'create_subscription', 'subscription', sub.id, null, req.ip);
    return apiResponse.created(res, sub);
  } catch (err) {
    next(err);
  }
};

// --- Payments ---
const listPayments = async (req, res, next) => {
  try {
    const { rows, count } = await paymentService.listPayments(req.query);
    return apiResponse.paginated(res, {
      rows,
      count,
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
    });
  } catch (err) {
    next(err);
  }
};

// --- Broadcast notifications ---
const broadcast = async (req, res, next) => {
  try {
    const { title, body, type = 'broadcast' } = req.body;
    const users = await User.findAll({ where: { is_active: true }, attributes: ['id'] });

    const notifications = users.map((u) => ({
      user_id: u.id,
      title,
      body,
      type,
    }));

    await Notification.bulkCreate(notifications);
    await logAdminAction(req.user.id, 'broadcast', 'notification', null, { title, count: users.length }, req.ip);

    const io = req.app.get('io');
    if (io) io.emit('notification:broadcast', { title, body, type });

    return apiResponse.success(res, { sent: users.length }, 'Broadcast sent');
  } catch (err) {
    next(err);
  }
};

// --- Trading pairs ---
const listTradingPairs = async (req, res, next) => {
  try {
    const pairs = await TradingPair.findAll({ order: [['symbol', 'ASC']] });
    return apiResponse.success(res, pairs);
  } catch (err) {
    next(err);
  }
};

const createTradingPair = async (req, res, next) => {
  try {
    const { symbol, baseAsset, quoteAsset, exchange, isActive, minPrice, maxPrice, metadata } = req.body;
    const pair = await TradingPair.create({
      symbol,
      base_asset: baseAsset,
      quote_asset: quoteAsset,
      exchange,
      is_active: isActive,
      min_price: minPrice,
      max_price: maxPrice,
      metadata,
    });
    await logAdminAction(req.user.id, 'create_trading_pair', 'trading_pair', pair.id, null, req.ip);
    return apiResponse.created(res, pair);
  } catch (err) {
    next(err);
  }
};

const updateTradingPair = async (req, res, next) => {
  try {
    const pair = await TradingPair.findByPk(req.params.id);
    if (!pair) throw new AppError('Trading pair not found', 404);
    await pair.update(req.body);
    return apiResponse.success(res, pair);
  } catch (err) {
    next(err);
  }
};

const deleteTradingPair = async (req, res, next) => {
  try {
    const pair = await TradingPair.findByPk(req.params.id);
    if (!pair) throw new AppError('Trading pair not found', 404);
    await pair.destroy();
    return apiResponse.success(res, null, 'Trading pair deleted');
  } catch (err) {
    next(err);
  }
};

// --- Analytics ---
const analytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [signalsByType, paymentsByStatus, newUsers] = await Promise.all([
      Signal.findAll({
        attributes: ['type', [Signal.sequelize.fn('COUNT', '*'), 'count']],
        group: ['type'],
        raw: true,
      }),
      Payment.findAll({
        attributes: ['status', [Payment.sequelize.fn('COUNT', '*'), 'count']],
        group: ['status'],
        raw: true,
      }),
      User.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } }),
    ]);

    return apiResponse.success(res, { signalsByType, paymentsByStatus, newUsersLast30Days: newUsers });
  } catch (err) {
    next(err);
  }
};

// --- Settings ---
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll();
    return apiResponse.success(res, settings);
  } catch (err) {
    next(err);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const [setting] = await Setting.findOrCreate({
      where: { key: req.params.key },
      defaults: { value: req.body.value, type: req.body.type || 'string' },
    });
    await setting.update({ value: req.body.value, description: req.body.description });
    return apiResponse.success(res, setting);
  } catch (err) {
    next(err);
  }
};

const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const { rows, count } = await AdminLog.findAndCountAll({
      include: [{ model: User, as: 'admin', attributes: ['email', 'first_name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });
    return apiResponse.paginated(res, { rows, count, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  listUsers,
  updateUser,
  deleteUser,
  listSignals,
  createSignal,
  updateSignal,
  deleteSignal,
  listSubscriptions,
  createSubscription,
  listPayments,
  broadcast,
  listTradingPairs,
  createTradingPair,
  updateTradingPair,
  deleteTradingPair,
  analytics,
  getSettings,
  updateSetting,
  getAdminLogs,
};
