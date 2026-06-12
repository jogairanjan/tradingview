const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Signal = sequelize.define(
  'Signal',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trading_pair_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('buy', 'sell', 'hold'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'cancelled', 'expired'),
      defaultValue: 'active',
    },
    entry_price: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    stop_loss: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    take_profit: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    take_profit_2: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    confidence: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    timeframe: {
      type: DataTypes.STRING(10),
      defaultValue: '1h',
    },
    source: {
      type: DataTypes.ENUM('manual', 'python', 'admin'),
      defaultValue: 'manual',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pnl_percent: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
  },
  {
    tableName: 'signals',
    indexes: [
      { fields: ['trading_pair_id'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
    ],
  }
);

module.exports = Signal;
