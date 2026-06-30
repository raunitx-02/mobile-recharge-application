const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
    type: DataTypes.ENUM('prepaid', 'postpaid', 'dth', 'bbps'),
    allowNull: false
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: false
  },
  operator_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_no: {
    type: DataTypes.STRING,
    allowNull: false
  },
  circle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  opening_balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  recharge_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  debit_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  closing_balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  api_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  api_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  live_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  api_request_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded', 'disputed'),
    defaultValue: 'pending',
    allowNull: false
  },
  refund_status: {
    type: DataTypes.ENUM('none', 'disputed', 'rejected', 'refunded'),
    defaultValue: 'none',
    allowNull: false
  },
  request_mode: {
    type: DataTypes.ENUM('app', 'api'),
    defaultValue: 'app',
    allowNull: false
  },
  switching_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  r_offer_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  api_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validity_days: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  validity_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  kwik_plan_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bill_reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true
});

module.exports = Transaction;
