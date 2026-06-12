const tickerService = require('../services/tickerService');
const { emitTicker } = require('../websockets');
const logger = require('../utils/logger');

const TICKER_INTERVAL_MS = Number(process.env.TICKER_CRON_MS) || 15000;

/**
 * Broadcast live ticker updates over Socket.IO.
 * @param {import('socket.io').Server|null} io
 */
const startTickerCron = (io) => {
  if (!io) return;

  const run = async () => {
    try {
      const tickers = await tickerService.getTickers(tickerService.DEFAULT_SYMBOLS);
      if (!Array.isArray(tickers) || !tickers.length) return;

      io.emit('market:tickers', tickers);
      tickers.forEach((t) => {
        if (t?.symbol) emitTicker(io, t.symbol, t);
      });
    } catch (err) {
      logger.debug(`Ticker cron skipped: ${err.message}`);
    }
  };

  run();
  const timer = setInterval(run, TICKER_INTERVAL_MS);
  logger.info(`Ticker cron started (every ${TICKER_INTERVAL_MS}ms)`);

  return () => clearInterval(timer);
};

module.exports = { startTickerCron };
