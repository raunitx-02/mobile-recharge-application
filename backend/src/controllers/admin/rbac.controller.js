const { Role, AdminUser } = require('../../models');
const response = require('../../utils/response');
const bcrypt = require('bcryptjs');

// GET /roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return response.success(res, roles, 'Roles retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch roles', 500);
  }
};

// POST /roles
const createRole = async (req, res) => {
  const { name, permissions } = req.body;

  try {
    const exists = await Role.findOne({ where: { name } });
    if (exists) {
      return response.error(res, `Role name ${name} already exists`, 400);
    }

    const role = await Role.create({ name, permissions });
    return response.success(res, role, 'Role created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create role', 500);
  }
};

// PUT /roles/:id
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return response.error(res, 'Role not found', 404);
    }

    await role.update({
      name: name || role.name,
      permissions: permissions || role.permissions
    });

    return response.success(res, role, 'Role updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update role', 500);
  }
};

// DELETE /roles/:id
const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return response.error(res, 'Role not found', 404);
    }

    await role.destroy();
    return response.success(res, null, 'Role deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to delete role', 500);
  }
};

// GET /admin-users
const getAdminUsers = async (req, res) => {
  try {
    const users = await AdminUser.findAll({
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: { exclude: ['password_hash'] }
    });
    return response.success(res, users, 'Admin users retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch admin users', 500);
  }
};

// POST /admin-users
const createAdminUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    const exists = await AdminUser.findOne({ where: { email } });
    if (exists) {
      return response.error(res, 'Email already in use by another admin', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await AdminUser.create({
      name,
      email,
      password_hash,
      role_id,
      status: 'active'
    });

    const plain = user.toJSON();
    delete plain.password_hash;

    return response.success(res, plain, 'Admin user created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create admin user', 500);
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAdminUsers,
  createAdminUser
};
