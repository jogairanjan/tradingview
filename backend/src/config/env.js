require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'tradingview_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'TradingView Signals <noreply@example.com>',
  },

  pythonBridge: {
    // Use 127.0.0.1 — on Windows "localhost" often resolves to IPv6 ::1 and refuses connection
    baseUrl: (process.env.PYTHON_BRIDGE_URL || 'http://127.0.0.1:8000').replace(
      /\/\/localhost\b/i,
      '//127.0.0.1'
    ),
    signalEndpoint: process.env.PYTHON_SIGNAL_ENDPOINT || '/api/generate-signal',
  },

  payment: {
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@tradingview.local',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  isDev: () => (process.env.NODE_ENV || 'development') === 'development',
  isProd: () => process.env.NODE_ENV === 'production',
};

module.exports = env;
