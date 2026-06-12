const logger = require('../utils/logger');

/**
 * Initialize Socket.IO event handlers for live signals and market tickers.
 * @param {import('socket.io').Server} io
 */
const initWebSockets = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Subscribe to all live signals
    socket.on('subscribe:signals', () => {
      socket.join('signals');
      socket.emit('subscribed', { channel: 'signals' });
    });

    // Subscribe to specific trading pair ticker
    socket.on('subscribe:ticker', (symbol) => {
      if (!symbol) return;
      const room = `ticker:${String(symbol).toUpperCase()}`;
      socket.join(room);
      socket.emit('subscribed', { channel: room });
    });

    socket.on('unsubscribe:ticker', (symbol) => {
      if (!symbol) return;
      socket.leave(`ticker:${String(symbol).toUpperCase()}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
};

/**
 * Emit a new signal to all subscribed clients.
 */
const emitSignal = (io, signal) => {
  if (!io) return;
  io.to('signals').emit('signal:new', signal);
};

/**
 * Emit market ticker update for a symbol.
 */
const emitTicker = (io, symbol, ticker) => {
  if (!io) return;
  io.to(`ticker:${String(symbol).toUpperCase()}`).emit('ticker:update', ticker);
};

module.exports = { initWebSockets, emitSignal, emitTicker };
