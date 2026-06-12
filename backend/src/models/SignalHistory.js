const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SignalHistory = sequelize.define(
  'SignalHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    signal_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.ENUM('created', 'updated', 'closed', 'cancelled', 'price_hit'),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'signal_history',
    updatedAt: false,
    indexes: [{ fields: ['signal_id'] }, { fields: ['created_at'] }],
  }
);

module.exports = SignalHistory;
