const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FundRequest = sequelize.define('FundRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  transfer_mode: {
    type: DataTypes.STRING, // NEFT, IMPS, UPI, CASH
    allowNull: false
  },
  bank_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reference_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fund_requests',
  timestamps: true,
  underscored: true
});

module.exports = FundRequest;
