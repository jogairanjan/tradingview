const cron = require('node-cron');
const signalService = require('../services/signalService');
const tickerService = require('../services/tickerService');
const { emitSignal } = require('../websockets');
const logger = require('../utils/logger');

/**
 * Schedule Python signal generation every 5 minutes.
 * @param {import('socket.io').Server|null} io
 */
const startSignalCron = (io) => {
  // Every 5 minutes
  const task = cron.schedule('*/5 * * * *', async () => {
    logger.info('Cron: triggering Python signal generation');
    try {
      const result = await signalService.generateSignalsFromPython({
        symbols: tickerService.DEFAULT_SYMBOLS,
        timeframe: '1h',
      });
      if (io && result.signals) {
        for (const signal of result.signals) {
          emitSignal(io, signal);
        }
      }
      logger.info(`Cron: generated ${result.generated} signal(s)`);
    } catch (err) {
      logger.error(`Cron signal generation failed: ${err.message}`);
    }
  });

  logger.info('Signal cron job scheduled (every 5 minutes)');
  return task;
};

module.exports = { startSignalCron };
