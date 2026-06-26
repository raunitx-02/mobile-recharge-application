const express = require('express');
const router = express.Router();

const rbacController = require('../../controllers/admin/rbac.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);

router.get('/roles', hasPermission('rbac:read'), rbacController.getRoles);
router.post('/roles', hasPermission('rbac:write'), rbacController.createRole);
router.put('/roles/:id', hasPermission('rbac:write'), rbacController.updateRole);
router.delete('/roles/:id', hasPermission('rbac:write'), rbacController.deleteRole);

router.get('/users', hasPermission('rbac:read'), rbacController.getAdminUsers);
router.post('/users', hasPermission('rbac:write'), rbacController.createAdminUser);

module.exports = router;
