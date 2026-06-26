const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/admin/dashboard.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.get('/dashboard', verifyAdminJWT, hasPermission('dashboard:read'), dashboardController.getDashboardStats);

module.exports = router;
