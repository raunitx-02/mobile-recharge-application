const response = require('../utils/response');

const hasPermission = (permission) => (req, res, next) => {
  const adminUser = req.adminUser;
  if (!adminUser || !adminUser.role) {
    return response.error(res, 'RBAC Role not assigned', 403);
  }

  const permissions = adminUser.role.permissions || [];
  
  // SuperAdmin overrides all permissions checks
  if (adminUser.role.name === 'SuperAdmin') {
    return next();
  }

  if (!permissions.includes(permission)) {
    return response.error(res, `Insufficient permissions. Required: ${permission}`, 403);
  }

  next();
};

module.exports = {
  hasPermission
};
