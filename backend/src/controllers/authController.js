const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return apiResponse.created(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body);
    return apiResponse.success(res, tokens, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.user.id);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return apiResponse.success(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const tokens = await authService.verifyOtp(req.body);
    return apiResponse.success(res, tokens, 'Email verified');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendOtp(req.body.email);
    return apiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'otp_code', 'reset_token'] },
    });
    return apiResponse.success(res, { user: authService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  resendOtp,
  getMe,
};
