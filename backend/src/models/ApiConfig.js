const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiConfig = sequelize.define('ApiConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('recharge1', 'pay2all', 'billbox', 'generic_rest'),
    allowNull: false
  },
  base_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  balance_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  credentials_encrypted: {
    type: DataTypes.TEXT, // Encrypted JSON configuration
    allowNull: false
  },
  in_switch: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'api_configs',
  timestamps: true,
  underscored: true
});

module.exports = ApiConfig;
