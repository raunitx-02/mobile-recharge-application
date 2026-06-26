const { sequelize } = require('../config/database');

const User = require('./User');
const Transaction = require('./Transaction');
const WalletTransaction = require('./WalletTransaction');
const FundRequest = require('./FundRequest');
const Operator = require('./Operator');
const Plan = require('./Plan');
const Offer = require('./Offer');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const ApiConfig = require('./ApiConfig');
const ApiLog = require('./ApiLog');
const Commission = require('./Commission');
const AdminUser = require('./AdminUser');
const Role = require('./Role');
const Banner = require('./Banner');
const Notification = require('./Notification');
const OTPRecord = require('./OTPRecord');
const CircleSwitch = require('./CircleSwitch');

// Setup Associations

// User associations
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(WalletTransaction, { foreignKey: 'user_id', as: 'walletTransactions' });
WalletTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(FundRequest, { foreignKey: 'user_id', as: 'fundRequests' });
FundRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsTo(ApiConfig, { foreignKey: 'api_override_id', as: 'apiOverride' });

// Referred by self-association
User.belongsTo(User, { foreignKey: 'referred_by', as: 'referrer' });
User.hasMany(User, { foreignKey: 'referred_by', as: 'referrals' });

// Operator & Plans
Operator.hasMany(Plan, { foreignKey: 'operator_id', as: 'plans' });
Plan.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' });

// Commission rules
Commission.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' });
Commission.belongsTo(ApiConfig, { foreignKey: 'api_config_id', as: 'apiConfig' });
Commission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Circle Switch API routing
CircleSwitch.belongsTo(Operator, { foreignKey: 'operator_id', as: 'operator' });
CircleSwitch.belongsTo(ApiConfig, { foreignKey: 'api_config_id', as: 'apiConfig' });

// Transaction Associations
Transaction.belongsTo(ApiConfig, { foreignKey: 'api_id', as: 'apiConfig' });

// Coupon usages
CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
CouponUsage.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });

// Admin & Role
Role.hasMany(AdminUser, { foreignKey: 'role_id', as: 'adminUsers' });
AdminUser.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Api logs
ApiLog.belongsTo(ApiConfig, { foreignKey: 'api_config_id', as: 'apiConfig' });
ApiLog.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });

module.exports = {
  sequelize,
  User,
  Transaction,
  WalletTransaction,
  FundRequest,
  Operator,
  Plan,
  Offer,
  Coupon,
  CouponUsage,
  ApiConfig,
  ApiLog,
  Commission,
  AdminUser,
  Role,
  Banner,
  Notification,
  OTPRecord,
  CircleSwitch
};
