const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  referral_code: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true
  },
  referred_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  kyc_status: {
    type: DataTypes.ENUM('pending', 'submitted', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  fcm_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  api_override_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
