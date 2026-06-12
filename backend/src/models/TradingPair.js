const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TradingPair = sequelize.define(
  'TradingPair',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    base_asset: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    quote_asset: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    exchange: {
      type: DataTypes.STRING(50),
      defaultValue: 'binance',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    min_price: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    max_price: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'trading_pairs',
    indexes: [
      { unique: true, fields: ['symbol'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = TradingPair;
