const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { AppError } = require('./errorHandler');

/**
 * Protect routes — requires valid Bearer access token.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'otp_code', 'reset_token'] },
    });

    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
};

module.exports = authenticate;
