const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CircleSwitch = sequelize.define('CircleSwitch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operator_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  circle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  api_config_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'circle_switches',
  timestamps: true,
  underscored: true
});

module.exports = CircleSwitch;
