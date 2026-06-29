require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Role, AdminUser, Operator, ApiConfig, Commission, Banner, Offer, Coupon, sequelize } = require('../models');
const { encrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

async function runSeeders() {
  logger.info('Initializing standalone database seed script...');

  try {
    await sequelize.authenticate();
    logger.info('DB connection authenticated. Syncing schemas...');
    await sequelize.sync({ force: true }); // Wipe clean and rebuild tables for seed validation

    // 1. Roles & Permissions
    const superAdminRole = await Role.create({
      name: 'SuperAdmin',
      permissions: [
        'dashboard:read', 'users:read', 'users:write', 'users:block',
        'wallet:credit', 'wallet:debit', 'operators:read', 'operators:write',
        'plans:read', 'plans:write', 'api:read', 'api:write', 'api:switch',
        'reports:read', 'reports:export', 'commissions:read', 'commissions:write',
        'content:read', 'content:write', 'rbac:read', 'rbac:write'
      ]
    });

    const managerRole = await Role.create({
      name: 'Manager',
      permissions: [
        'dashboard:read', 'users:read', 'operators:read', 'plans:read',
        'api:read', 'reports:read', 'commissions:read', 'content:read'
      ]
    });

    logger.info('RBAC Roles seeded.');

    // 2. Admin Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    await AdminUser.create({
      name: 'Super Administrator',
      email: 'admin@optionspay.in',
      password_hash: passwordHash,
      role_id: superAdminRole.id,
      status: 'active'
    });

    logger.info('Admin credentials seeded (Email: admin@optionspay.in, Pass: Admin@123).');

    // 3. Operators
    const ops = [
      { name: 'Jio Prepaid', code: 'JIO', type: 'prepaid', logo_url: 'https://logo.clearbit.com/jio.com' },
      { name: 'Airtel Prepaid', code: 'AIRTEL', type: 'prepaid', logo_url: 'https://logo.clearbit.com/airtel.in' },
      { name: 'Vi Prepaid', code: 'VI', type: 'prepaid', logo_url: 'https://logo.clearbit.com/myvi.in' },
      { name: 'BSNL Prepaid', code: 'BSNL', type: 'prepaid', logo_url: 'https://logo.clearbit.com/bsnl.co.in' },
      
      { name: 'Tata Play DTH', code: 'TATAPLAY', type: 'dth', logo_url: 'https://logo.clearbit.com/tataplay.com' },
      { name: 'Dish TV DTH', code: 'DISHTV', type: 'dth', logo_url: 'https://logo.clearbit.com/dishtv.in' },

      { name: 'MSEB Electricity', code: 'MSEB_ELEC', type: 'bbps', logo_url: 'https://logo.clearbit.com/mahadiscom.in' },
      { name: 'Delhi Jal Board Water', code: 'DJB_WATER', type: 'bbps', logo_url: 'https://logo.clearbit.com/delhi.gov.in' }
    ];

    const operatorModels = {};
    for (const op of ops) {
      const createdOp = await Operator.create(op);
      operatorModels[op.code] = createdOp;
    }
    logger.info('Major Indian telecom and utility operators seeded.');

    // 4. API Provider Configs
    const mockCreds = encrypt(JSON.stringify({ mock_api: true }));
    const mockApiConfig = await ApiConfig.create({
      name: 'OptionsPay Mock API',
      type: 'recharge1',
      base_url: 'https://api.mock.optionspay.in/recharge',
      status_url: 'https://api.mock.optionspay.in/status',
      balance_url: 'https://api.mock.optionspay.in/balance',
      credentials_encrypted: mockCreds,
      in_switch: true,
      status: true
    });
    logger.info('Default Mock API config seeded.');

    // 5. Commission slabs
    for (const opCode of Object.keys(operatorModels)) {
      const op = operatorModels[opCode];
      await Commission.create({
        operator_id: op.id,
        circle: null, // Global
        api_config_id: mockApiConfig.id,
        user_id: null,
        type: 'percentage',
        value: 3.50, // 3.50% standard commission payout
        min_amount: 10.00,
        status: true
      });
    }
    logger.info('Standard 3.50% commission slabs seeded.');

    // 6. Content (Banners / Coupons)
    await Banner.create({
      title: 'Flat 5% Wallet Cashback Offer',
      image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      link_url: '#',
      position: 0,
      status: true
    });

    await Banner.create({
      title: 'BBPS Bill Payments Commencing',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
      link_url: '#',
      position: 1,
      status: true
    });

    await Coupon.create({
      code: 'FIRST50',
      discount_type: 'flat',
      value: 50.00,
      min_recharge: 500.00,
      usage_limit: 1000,
      valid_till: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: true
    });

    logger.info('Marketing banners and coupons seeded.');
    logger.info('Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    logger.error('Database seeding failed:', err);
    process.exit(1);
  }
}

// Check if run directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
