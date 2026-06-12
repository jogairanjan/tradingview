const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const { connectDatabase, syncDatabase } = require('./config/database');
const { initWebSockets } = require('./websockets');
const { startSignalCron } = require('./jobs/signalCron');
const { startTickerCron } = require('./jobs/tickerCron');
const logger = require('./utils/logger');
const { User, TradingPair, Setting } = require('./models');
const bcrypt = require('bcryptjs');

/**
 * Seed default admin user and sample data in development.
 */
const seedDevData = async () => {
  if (!env.isDev()) return;

  const [admin, created] = await User.findOrCreate({
    where: { email: env.admin.email },
    defaults: {
      email: env.admin.email,
      password_hash: await bcrypt.hash(env.admin.password, 12),
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_verified: true,
      is_active: true,
    },
  });

  if (created) {
    logger.info(`Admin user seeded: ${admin.email}`);
  }

  const defaultPairs = [
    { symbol: 'BTCUSDT', base_asset: 'BTC', quote_asset: 'USDT' },
    { symbol: 'ETHUSDT', base_asset: 'ETH', quote_asset: 'USDT' },
    { symbol: 'SOLUSDT', base_asset: 'SOL', quote_asset: 'USDT' },
  ];

  for (const pair of defaultPairs) {
    await TradingPair.findOrCreate({ where: { symbol: pair.symbol }, defaults: pair });
  }

  await Setting.findOrCreate({
    where: { key: 'signal_generation_enabled' },
    defaults: { value: 'true', type: 'boolean', description: 'Enable cron signal generation', is_public: false },
  });

  logger.info('Development seed data applied');
};

const startServer = async () => {
  try {
    require('./models'); // load associations before sync
    await connectDatabase();
    await syncDatabase();
    await seedDevData();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: { origin: env.clientUrl, methods: ['GET', 'POST'] },
    });

    app.set('io', io);
    initWebSockets(io);
    startSignalCron(io);
    startTickerCron(io);

    server.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
      logger.info(`Swagger docs: http://localhost:${env.port}/api/docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

startServer();
