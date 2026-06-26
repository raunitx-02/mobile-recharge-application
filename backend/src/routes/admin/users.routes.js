const express = require('express');
const router = express.Router();

const usersController = require('../../controllers/admin/users.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/', hasPermission('users:read'), usersController.getUsers);
router.get('/:id', hasPermission('users:read'), usersController.getUserDetail);
router.put('/:id/status', hasPermission('users:block'), usersController.updateUserStatus);
router.put('/:id/wallet', hasPermission('wallet:credit'), validate(adminValidator.walletAdjustment), usersController.adjustUserWallet);
router.put('/:id/api-override', hasPermission('api:switch'), validate(adminValidator.apiOverride), usersController.overrideUserApi);

module.exports = router;
