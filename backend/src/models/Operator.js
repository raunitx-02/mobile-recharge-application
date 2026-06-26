const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Operator = sequelize.define('Operator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('prepaid', 'postpaid', 'dth', 'bbps'),
    allowNull: false
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'operators',
  timestamps: true,
  underscored: true
});

module.exports = Operator;
