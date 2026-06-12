const { AppError } = require('./errorHandler');

/**
 * Restrict route to admin role (must run after authenticate).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  return next();
};

module.exports = requireAdmin;
