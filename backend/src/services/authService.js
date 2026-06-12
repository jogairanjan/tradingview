const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateOtp,
} = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const { sendOtpEmail, sendPasswordResetEmail } = require('./emailService');

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const sanitizeUser = (user) => {
  const plain = user.get ? user.get({ plain: true }) : user;
  delete plain.password_hash;
  delete plain.refresh_token;
  delete plain.otp_code;
  delete plain.reset_token;
  return plain;
};

const issueTokens = async (user) => {
  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await user.update({ refresh_token: refreshToken, last_login_at: new Date() });
  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

const register = async ({ email, password, firstName, lastName }) => {
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) throw new AppError('Email already registered', 409);

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash: await hashPassword(password),
    first_name: firstName,
    last_name: lastName,
    otp_code: otp,
    otp_expires_at: otpExpires,
  });

  await sendOtpEmail(user.email, otp);
  return { message: 'Registration successful. Please verify your email with the OTP sent.', userId: user.id };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.is_active) throw new AppError('Account is deactivated', 403);
  return issueTokens(user);
};

const logout = async (userId) => {
  await User.update({ refresh_token: null }, { where: { id: userId } });
  return { message: 'Logged out successfully' };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findByPk(decoded.userId);
  if (!user || user.refresh_token !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  return issueTokens(user);
};

const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
      otp_code: otp,
      otp_expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!user) throw new AppError('Invalid or expired OTP', 400);

  await user.update({ is_verified: true, otp_code: null, otp_expires_at: null });
  return issueTokens(user);
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await user.update({ reset_token: resetToken, reset_token_expires_at: expires });
  await sendPasswordResetEmail(user.email, resetToken);

  return { message: 'If the email exists, a reset link has been sent' };
};

const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_token_expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  await user.update({
    password_hash: await hashPassword(password),
    reset_token: null,
    reset_token_expires_at: null,
    refresh_token: null,
  });

  return { message: 'Password reset successful' };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user || !(await comparePassword(currentPassword, user.password_hash))) {
    throw new AppError('Current password is incorrect', 400);
  }

  await user.update({
    password_hash: await hashPassword(newPassword),
    refresh_token: null,
  });

  return { message: 'Password changed successfully' };
};

const resendOtp = async (email) => {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) throw new AppError('User not found', 404);
  if (user.is_verified) throw new AppError('Email already verified', 400);

  const otp = generateOtp();
  await user.update({
    otp_code: otp,
    otp_expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });
  await sendOtpEmail(user.email, otp);
  return { message: 'OTP sent successfully' };
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
  sanitizeUser,
};
