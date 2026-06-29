const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/users.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);

router.get('/', hasPermission('users:read'), usersController.getUsers);
router.get('/:id', hasPermission('users:read'), usersController.getUserDetail);
router.put('/:id', hasPermission('users:write'), usersController.updateUser);
router.patch('/:id', hasPermission('users:write'), usersController.updateUser);

// Accept both PUT and PATCH for status update
router.put('/:id/status', hasPermission('users:block'), usersController.updateUserStatus);
router.patch('/:id/status', hasPermission('users:block'), usersController.updateUserStatus);

// Wallet adjustment
router.put('/:id/wallet', hasPermission('wallet:credit'), usersController.adjustUserWallet);
router.post('/:id/wallet', hasPermission('wallet:credit'), usersController.adjustUserWallet);

module.exports = router;
