const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

/**
 * Lazy-init SMTP transporter; logs instead of sending when SMTP is not configured.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.smtp.host || !env.smtp.user) {
    logger.warn('SMTP not configured — emails will be logged only');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();

  if (!transport) {
    logger.info(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { messageId: 'mock-' + Date.now() };
  }

  const info = await transport.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });

  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

const sendOtpEmail = async (to, otp) =>
  sendEmail({
    to,
    subject: 'Your verification code',
    html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
  });

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
  return sendEmail({
    to,
    subject: 'Password reset request',
    html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>Link expires in 1 hour.</p>`,
  });
};

module.exports = { sendEmail, sendOtpEmail, sendPasswordResetEmail };
