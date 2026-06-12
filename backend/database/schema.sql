-- TradingView Signals Platform - MySQL Schema
-- Run this in production; use Sequelize sync only in development.

CREATE DATABASE IF NOT EXISTS tradingview_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tradingview_db;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  phone VARCHAR(20) NULL,
  avatar_url VARCHAR(500) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  refresh_token TEXT NULL,
  otp_code VARCHAR(10) NULL,
  otp_expires_at DATETIME NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Trading Pairs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trading_pairs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  base_asset VARCHAR(10) NOT NULL,
  quote_asset VARCHAR(10) NOT NULL,
  exchange VARCHAR(50) NOT NULL DEFAULT 'binance',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  min_price DECIMAL(20, 8) NULL,
  max_price DECIMAL(20, 8) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_trading_pairs_symbol (symbol),
  KEY idx_trading_pairs_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Signals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signals (
  id CHAR(36) NOT NULL PRIMARY KEY,
  trading_pair_id CHAR(36) NOT NULL,
  created_by CHAR(36) NULL,
  type ENUM('buy', 'sell', 'hold') NOT NULL,
  status ENUM('active', 'closed', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8) NULL,
  take_profit DECIMAL(20, 8) NULL,
  take_profit_2 DECIMAL(20, 8) NULL,
  confidence DECIMAL(5, 2) NULL,
  timeframe VARCHAR(10) NOT NULL DEFAULT '1h',
  source ENUM('manual', 'python', 'admin') NOT NULL DEFAULT 'manual',
  notes TEXT NULL,
  closed_at DATETIME NULL,
  pnl_percent DECIMAL(10, 4) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_signals_trading_pair_id (trading_pair_id),
  KEY idx_signals_status (status),
  KEY idx_signals_type (type),
  KEY idx_signals_created_at (created_at),
  CONSTRAINT fk_signals_trading_pair
    FOREIGN KEY (trading_pair_id) REFERENCES trading_pairs(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_signals_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Signal History
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signal_history (
  id CHAR(36) NOT NULL PRIMARY KEY,
  signal_id CHAR(36) NOT NULL,
  event_type ENUM('created', 'updated', 'closed', 'cancelled', 'price_hit') NOT NULL,
  price DECIMAL(20, 8) NULL,
  message TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_signal_history_signal_id (signal_id),
  KEY idx_signal_history_created_at (created_at),
  CONSTRAINT fk_signal_history_signal
    FOREIGN KEY (signal_id) REFERENCES signals(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Watchlists
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS watchlists (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  trading_pair_id CHAR(36) NOT NULL,
  alerts_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_watchlists_user_pair (user_id, trading_pair_id),
  KEY idx_watchlists_user_id (user_id),
  CONSTRAINT fk_watchlists_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_watchlists_trading_pair
    FOREIGN KEY (trading_pair_id) REFERENCES trading_pairs(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  plan ENUM('free', 'basic', 'pro', 'enterprise') NOT NULL DEFAULT 'free',
  status ENUM('active', 'cancelled', 'expired', 'pending') NOT NULL DEFAULT 'pending',
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  auto_renew TINYINT(1) NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_subscriptions_user_id (user_id),
  KEY idx_subscriptions_status (status),
  KEY idx_subscriptions_ends_at (ends_at),
  CONSTRAINT fk_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  subscription_id CHAR(36) NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
  provider_ref VARCHAR(255) NULL,
  metadata JSON NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_user_id (user_id),
  KEY idx_payments_status (status),
  KEY idx_payments_provider_ref (provider_ref),
  CONSTRAINT fk_payments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payments_subscription
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type ENUM('signal', 'payment', 'system', 'broadcast') NOT NULL DEFAULT 'system',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_type (type),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Admin Logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  admin_id CHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id CHAR(36) NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_admin_logs_admin_id (admin_id),
  KEY idx_admin_logs_action (action),
  KEY idx_admin_logs_created_at (created_at),
  CONSTRAINT fk_admin_logs_admin
    FOREIGN KEY (admin_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id CHAR(36) NOT NULL PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL,
  value TEXT NULL,
  type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  description VARCHAR(255) NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_settings_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
