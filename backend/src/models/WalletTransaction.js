const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference_type: {
    type: DataTypes.ENUM('recharge', 'refund', 'payment_gateway', 'manual_adjustment', 'fund_request', 'commission'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance_before: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  balance_after: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'wallet_transactions',
  timestamps: true,
  underscored: true
});

module.exports = WalletTransaction;
