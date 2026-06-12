const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminLog = sequelize.define(
  'AdminLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    tableName: 'admin_logs',
    updatedAt: false,
    indexes: [
      { fields: ['admin_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
    ],
  }
);

module.exports = AdminLog;
