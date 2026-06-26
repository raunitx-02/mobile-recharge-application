const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Commission = sequelize.define('Commission', {
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
    allowNull: true // Null means applicable to all circles
  },
  api_config_id: {
    type: DataTypes.UUID,
    allowNull: true // Null means applicable to all APIs
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true // Null means generic slab
  },
  type: {
    type: DataTypes.ENUM('flat', 'percentage'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  max_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // Null means no limit
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'commissions',
  timestamps: true,
  underscored: true
});

module.exports = Commission;
