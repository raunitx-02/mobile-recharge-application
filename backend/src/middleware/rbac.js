const response = require('../utils/response');

const hasPermission = (permission) => (req, res, next) => {
  const adminUser = req.adminUser;
  if (!adminUser || !adminUser.role) {
    return response.error(res, 'RBAC Role not assigned', 403);
  }

  const roleName = adminUser.role.name || '';

  // SuperAdmin overrides all permission checks (both naming conventions)
  if (
    roleName === 'SuperAdmin' ||
    roleName === 'super_admin' ||
    roleName.toLowerCase() === 'superadmin'
  ) {
    return next();
  }

  // Parse permissions - handle both JSON string and array
  let permissions = adminUser.role.permissions || [];
  if (typeof permissions === 'string') {
    try { permissions = JSON.parse(permissions); } catch { permissions = []; }
  }

  // Wildcard grants all permissions
  if (permissions.includes('*')) {
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
