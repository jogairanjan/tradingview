const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a short-lived access token.
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

/**
 * Sign a long-lived refresh token.
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });

/**
 * Verify access token; throws on invalid/expired.
 */
const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

/**
 * Verify refresh token; throws on invalid/expired.
 */
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Generate a random OTP for email verification / password reset.
 */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOtp,
};
