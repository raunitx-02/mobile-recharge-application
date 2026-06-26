const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discount_type: {
    type: DataTypes.ENUM('flat', 'percentage'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_recharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  max_discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  valid_till: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  underscored: true
});

module.exports = Coupon;
