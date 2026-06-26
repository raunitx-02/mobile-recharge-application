const { verifyAdminToken } = require('../utils/jwt');
const { AdminUser, Role } = require('../models');
const response = require('../utils/response');

const verifyAdminJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Admin authentication token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAdminToken(token);
    const admin = await AdminUser.findByPk(decoded.adminId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin) {
      return response.error(res, 'Admin account not found', 401);
    }

    if (admin.status === 'blocked') {
      return response.error(res, 'Admin account has been blocked', 403);
    }

    req.adminUser = admin;
    next();
  } catch (err) {
    return response.error(res, 'Invalid or expired admin session token', 401);
  }
};

module.exports = verifyAdminJWT;
