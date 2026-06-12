const User = require('./User');
const TradingPair = require('./TradingPair');
const Signal = require('./Signal');
const SignalHistory = require('./SignalHistory');
const Watchlist = require('./Watchlist');
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const Notification = require('./Notification');
const AdminLog = require('./AdminLog');
const Setting = require('./Setting');

// User associations
User.hasMany(Signal, { foreignKey: 'created_by', as: 'signals' });
User.hasMany(Watchlist, { foreignKey: 'user_id', as: 'watchlists' });
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'adminLogs' });

// Trading pair associations
TradingPair.hasMany(Signal, { foreignKey: 'trading_pair_id', as: 'signals' });
TradingPair.hasMany(Watchlist, { foreignKey: 'trading_pair_id', as: 'watchlists' });

// Signal associations
Signal.belongsTo(TradingPair, { foreignKey: 'trading_pair_id', as: 'tradingPair' });
Signal.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Signal.hasMany(SignalHistory, { foreignKey: 'signal_id', as: 'history' });

SignalHistory.belongsTo(Signal, { foreignKey: 'signal_id', as: 'signal' });

Watchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Watchlist.belongsTo(TradingPair, { foreignKey: 'trading_pair_id', as: 'tradingPair' });

Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });

Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

module.exports = {
  User,
  TradingPair,
  Signal,
  SignalHistory,
  Watchlist,
  Subscription,
  Payment,
  Notification,
  AdminLog,
  Setting,
};
