const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiLog = sequelize.define('ApiLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  api_config_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  request_payload: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  response_payload: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'timeout'),
    defaultValue: 'success',
    allowNull: false
  }
}, {
  tableName: 'api_logs',
  timestamps: true,
  underscored: true
});

module.exports = ApiLog;
