const express = require('express');
const router = express.Router();

const reportsController = require('../../controllers/admin/reports.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);

router.get('/recharge', hasPermission('reports:read'), reportsController.getRechargeReport);
router.get('/recharge/export', hasPermission('reports:export'), reportsController.exportRechargeReport);

router.get('/fund-orders', hasPermission('reports:read'), reportsController.getFundOrdersReport);

module.exports = router;
