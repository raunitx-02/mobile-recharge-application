const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTPRecord = sequelize.define('OTPRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'verified', 'expired'),
    defaultValue: 'active',
    allowNull: false
  }
}, {
  tableName: 'otp_records',
  timestamps: true,
  underscored: true
});

module.exports = OTPRecord;
