const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define(
  'Watchlist',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    trading_pair_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    alerts_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'watchlists',
    indexes: [
      { unique: true, fields: ['user_id', 'trading_pair_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = Watchlist;
