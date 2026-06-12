const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.isDev() ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

/**
 * Test database connection on startup.
 */
const connectDatabase = async () => {
  await sequelize.authenticate();
  logger.info('MySQL connection established successfully');
};

/**
 * Sync models in development; use migrations in production.
 */
const syncDatabase = async () => {
  if (env.isDev()) {
    await sequelize.sync({ alter: true });
    logger.info('Database synced (development mode)');
  }
};

module.exports = { sequelize, connectDatabase, syncDatabase };
