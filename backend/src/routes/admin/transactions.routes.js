const express = require('express');
const router = express.Router();
const { getTransactions, updateTxnStatus } = require('../../controllers/admin/transactions.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);
router.get('/', hasPermission('transactions:read'), getTransactions);
router.patch('/:id/status', hasPermission('transactions:update'), updateTxnStatus);
router.put('/:id/status', hasPermission('transactions:update'), updateTxnStatus);

module.exports = router;
