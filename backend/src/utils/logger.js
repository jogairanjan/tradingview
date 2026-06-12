const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: env.isDev() ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tradingview-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          const base = `${timestamp} [${level}]: ${message}`;
          return stack ? `${base}\n${stack}` : base;
        })
      ),
    }),
  ],
});

module.exports = logger;
