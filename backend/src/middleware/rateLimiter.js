const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  skip: () => env.isDev(),
});

/** Stricter limiter for auth endpoints (relaxed in development) */
const authMax = env.isDev()
  ? parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 500
  : parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20;

const authWindowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10)
  || 15 * 60 * 1000;

const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  skip: (req) => env.isDev() && process.env.AUTH_RATE_LIMIT_DISABLED === 'true',
});

module.exports = { apiLimiter, authLimiter };
