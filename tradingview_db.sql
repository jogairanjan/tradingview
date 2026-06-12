-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2026 at 02:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tradingview_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` char(36) NOT NULL,
  `admin_id` char(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `type` enum('signal','payment','system','broadcast') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `subscription_id` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `provider` varchar(50) DEFAULT 'stripe',
  `provider_ref` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` char(36) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
('547ad4f6-baba-43d0-bbe4-3c47f15651b7', 'signal_generation_enabled', 'true', 'boolean', 'Enable cron signal generation', 0, '2026-05-18 10:02:11', '2026-05-18 10:02:11');

-- --------------------------------------------------------

--
-- Table structure for table `signals`
--

CREATE TABLE `signals` (
  `id` char(36) NOT NULL,
  `trading_pair_id` char(36) NOT NULL,
  `created_by` char(36) DEFAULT NULL,
  `type` enum('buy','sell','hold') NOT NULL,
  `status` enum('active','closed','cancelled','expired') DEFAULT 'active',
  `entry_price` decimal(20,8) NOT NULL,
  `stop_loss` decimal(20,8) DEFAULT NULL,
  `take_profit` decimal(20,8) DEFAULT NULL,
  `take_profit_2` decimal(20,8) DEFAULT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `timeframe` varchar(10) DEFAULT '1h',
  `source` enum('manual','python','admin') DEFAULT 'manual',
  `notes` text DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `pnl_percent` decimal(10,4) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signal_history`
--

CREATE TABLE `signal_history` (
  `id` char(36) NOT NULL,
  `signal_id` char(36) NOT NULL,
  `event_type` enum('created','updated','closed','cancelled','price_hit') NOT NULL,
  `price` decimal(20,8) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `plan` enum('free','basic','pro','enterprise') DEFAULT 'free',
  `status` enum('active','cancelled','expired','pending') DEFAULT 'pending',
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trading_pairs`
--

CREATE TABLE `trading_pairs` (
  `id` char(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `base_asset` varchar(10) NOT NULL,
  `quote_asset` varchar(10) NOT NULL,
  `exchange` varchar(50) DEFAULT 'binance',
  `is_active` tinyint(1) DEFAULT 1,
  `min_price` decimal(20,8) DEFAULT NULL,
  `max_price` decimal(20,8) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trading_pairs`
--

INSERT INTO `trading_pairs` (`id`, `symbol`, `base_asset`, `quote_asset`, `exchange`, `is_active`, `min_price`, `max_price`, `metadata`, `created_at`, `updated_at`) VALUES
('7dca3188-f78d-4519-850e-14875c5c4bf6', 'BTCUSDT', 'BTC', 'USDT', 'binance', 1, NULL, NULL, NULL, '2026-05-18 10:02:11', '2026-05-18 10:02:11'),
('89c152da-76ea-4b06-8631-d1d83865bcae', 'ETHUSDT', 'ETH', 'USDT', 'binance', 1, NULL, NULL, NULL, '2026-05-18 10:02:11', '2026-05-18 10:02:11'),
('f9efe7f0-7a00-43df-b0ca-22e950fc73a3', 'SOLUSDT', 'SOL', 'USDT', 'binance', 1, NULL, NULL, NULL, '2026-05-18 10:02:11', '2026-05-18 10:02:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `refresh_token` text DEFAULT NULL,
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `avatar_url`, `role`, `is_verified`, `is_active`, `refresh_token`, `otp_code`, `otp_expires_at`, `reset_token`, `reset_token_expires_at`, `last_login_at`, `created_at`, `updated_at`) VALUES
('14a99ce2-06aa-45f0-9ae9-9922b0fdbc93', 'ranjan0vns@gmail.com', '$2a$12$RBRgW6eaBLfIzn4okxeIv.R6tYrjyhCO3qmiv6ayRRywYOvfoDEGG', NULL, NULL, NULL, NULL, 'user', 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNGE5OWNlMi0wNmFhLTQ1ZjAtOWFlOS05OTIyYjBmZGJjOTMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc4MTI2NTUwMSwiZXhwIjoxNzgxODcwMzAxfQ.uFw9nlO99_GO-Donr9imy31KaTh0oYISxdU8NLrhSw0', '781702', '2026-05-18 10:18:33', NULL, NULL, '2026-06-12 11:58:21', '2026-05-18 10:08:34', '2026-06-12 11:58:21'),
('83438448-76ba-467b-adce-292aed13bcbd', 'admin@tradingview.local', '$2a$12$JkCe/4SaqfG3.4NXDzpr2uZVAcZbTdqHSHfLGiUYftTXEXGuZM/WK', 'Admin', 'User', NULL, NULL, 'admin', 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MzQzODQ0OC03NmJhLTQ2N2ItYWRjZS0yOTJhZWQxM2JjYmQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzkxMDAyNDQsImV4cCI6MTc3OTcwNTA0NH0.tOFYIZZcUMfCDLnH-zKS_PeIsdCDWvSz9ZMN1JPwDbo', NULL, NULL, NULL, NULL, '2026-05-18 10:30:44', '2026-05-18 10:02:11', '2026-05-18 10:30:44');

-- --------------------------------------------------------

--
-- Table structure for table `watchlists`
--

CREATE TABLE `watchlists` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `trading_pair_id` char(36) NOT NULL,
  `alerts_enabled` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_logs_admin_id` (`admin_id`),
  ADD KEY `idx_admin_logs_action` (`action`),
  ADD KEY `idx_admin_logs_created_at` (`created_at`),
  ADD KEY `admin_logs_admin_id` (`admin_id`),
  ADD KEY `admin_logs_action` (`action`),
  ADD KEY `admin_logs_created_at` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_is_read` (`is_read`),
  ADD KEY `idx_notifications_type` (`type`),
  ADD KEY `notifications_user_id` (`user_id`),
  ADD KEY `notifications_is_read` (`is_read`),
  ADD KEY `notifications_type` (`type`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_user_id` (`user_id`),
  ADD KEY `idx_payments_status` (`status`),
  ADD KEY `idx_payments_provider_ref` (`provider_ref`),
  ADD KEY `payments_user_id` (`user_id`),
  ADD KEY `payments_status` (`status`),
  ADD KEY `payments_provider_ref` (`provider_ref`),
  ADD KEY `subscription_id` (`subscription_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_settings_key` (`key`),
  ADD UNIQUE KEY `key` (`key`),
  ADD UNIQUE KEY `settings_key` (`key`),
  ADD UNIQUE KEY `key_2` (`key`),
  ADD UNIQUE KEY `key_3` (`key`),
  ADD UNIQUE KEY `key_4` (`key`),
  ADD UNIQUE KEY `key_5` (`key`),
  ADD UNIQUE KEY `key_6` (`key`),
  ADD UNIQUE KEY `key_7` (`key`),
  ADD UNIQUE KEY `key_8` (`key`),
  ADD UNIQUE KEY `key_9` (`key`),
  ADD UNIQUE KEY `key_10` (`key`),
  ADD UNIQUE KEY `key_11` (`key`),
  ADD UNIQUE KEY `key_12` (`key`),
  ADD UNIQUE KEY `key_13` (`key`),
  ADD UNIQUE KEY `key_14` (`key`),
  ADD UNIQUE KEY `key_15` (`key`),
  ADD UNIQUE KEY `key_16` (`key`),
  ADD UNIQUE KEY `key_17` (`key`),
  ADD UNIQUE KEY `key_18` (`key`),
  ADD UNIQUE KEY `key_19` (`key`),
  ADD UNIQUE KEY `key_20` (`key`),
  ADD UNIQUE KEY `key_21` (`key`),
  ADD UNIQUE KEY `key_22` (`key`),
  ADD UNIQUE KEY `key_23` (`key`),
  ADD UNIQUE KEY `key_24` (`key`),
  ADD UNIQUE KEY `key_25` (`key`),
  ADD UNIQUE KEY `key_26` (`key`),
  ADD UNIQUE KEY `key_27` (`key`);

--
-- Indexes for table `signals`
--
ALTER TABLE `signals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_signals_trading_pair_id` (`trading_pair_id`),
  ADD KEY `idx_signals_status` (`status`),
  ADD KEY `idx_signals_type` (`type`),
  ADD KEY `idx_signals_created_at` (`created_at`),
  ADD KEY `signals_trading_pair_id` (`trading_pair_id`),
  ADD KEY `signals_status` (`status`),
  ADD KEY `signals_type` (`type`),
  ADD KEY `signals_created_at` (`created_at`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `signal_history`
--
ALTER TABLE `signal_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_signal_history_signal_id` (`signal_id`),
  ADD KEY `idx_signal_history_created_at` (`created_at`),
  ADD KEY `signal_history_signal_id` (`signal_id`),
  ADD KEY `signal_history_created_at` (`created_at`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscriptions_user_id` (`user_id`),
  ADD KEY `idx_subscriptions_status` (`status`),
  ADD KEY `idx_subscriptions_ends_at` (`ends_at`),
  ADD KEY `subscriptions_user_id` (`user_id`),
  ADD KEY `subscriptions_status` (`status`),
  ADD KEY `subscriptions_ends_at` (`ends_at`);

--
-- Indexes for table `trading_pairs`
--
ALTER TABLE `trading_pairs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_trading_pairs_symbol` (`symbol`),
  ADD UNIQUE KEY `symbol` (`symbol`),
  ADD UNIQUE KEY `trading_pairs_symbol` (`symbol`),
  ADD UNIQUE KEY `symbol_2` (`symbol`),
  ADD UNIQUE KEY `symbol_3` (`symbol`),
  ADD UNIQUE KEY `symbol_4` (`symbol`),
  ADD UNIQUE KEY `symbol_5` (`symbol`),
  ADD UNIQUE KEY `symbol_6` (`symbol`),
  ADD UNIQUE KEY `symbol_7` (`symbol`),
  ADD UNIQUE KEY `symbol_8` (`symbol`),
  ADD UNIQUE KEY `symbol_9` (`symbol`),
  ADD UNIQUE KEY `symbol_10` (`symbol`),
  ADD UNIQUE KEY `symbol_11` (`symbol`),
  ADD UNIQUE KEY `symbol_12` (`symbol`),
  ADD UNIQUE KEY `symbol_13` (`symbol`),
  ADD UNIQUE KEY `symbol_14` (`symbol`),
  ADD UNIQUE KEY `symbol_15` (`symbol`),
  ADD UNIQUE KEY `symbol_16` (`symbol`),
  ADD UNIQUE KEY `symbol_17` (`symbol`),
  ADD UNIQUE KEY `symbol_18` (`symbol`),
  ADD UNIQUE KEY `symbol_19` (`symbol`),
  ADD UNIQUE KEY `symbol_20` (`symbol`),
  ADD UNIQUE KEY `symbol_21` (`symbol`),
  ADD UNIQUE KEY `symbol_22` (`symbol`),
  ADD UNIQUE KEY `symbol_23` (`symbol`),
  ADD UNIQUE KEY `symbol_24` (`symbol`),
  ADD UNIQUE KEY `symbol_25` (`symbol`),
  ADD UNIQUE KEY `symbol_26` (`symbol`),
  ADD UNIQUE KEY `symbol_27` (`symbol`),
  ADD UNIQUE KEY `symbol_28` (`symbol`),
  ADD UNIQUE KEY `symbol_29` (`symbol`),
  ADD UNIQUE KEY `symbol_30` (`symbol`),
  ADD UNIQUE KEY `symbol_31` (`symbol`),
  ADD UNIQUE KEY `symbol_32` (`symbol`),
  ADD KEY `idx_trading_pairs_is_active` (`is_active`),
  ADD KEY `trading_pairs_is_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_users_email` (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `users_email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_is_active` (`is_active`),
  ADD KEY `users_role` (`role`),
  ADD KEY `users_is_active` (`is_active`);

--
-- Indexes for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_watchlists_user_pair` (`user_id`,`trading_pair_id`),
  ADD UNIQUE KEY `watchlists_user_id_trading_pair_id` (`user_id`,`trading_pair_id`),
  ADD KEY `idx_watchlists_user_id` (`user_id`),
  ADD KEY `watchlists_user_id` (`user_id`),
  ADD KEY `trading_pair_id` (`trading_pair_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_55` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_56` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `signals`
--
ALTER TABLE `signals`
  ADD CONSTRAINT `signals_ibfk_59` FOREIGN KEY (`trading_pair_id`) REFERENCES `trading_pairs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `signals_ibfk_60` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `signal_history`
--
ALTER TABLE `signal_history`
  ADD CONSTRAINT `signal_history_ibfk_1` FOREIGN KEY (`signal_id`) REFERENCES `signals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD CONSTRAINT `watchlists_ibfk_55` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `watchlists_ibfk_56` FOREIGN KEY (`trading_pair_id`) REFERENCES `trading_pairs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
