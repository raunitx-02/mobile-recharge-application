const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard.routes');
const usersRoutes = require('./users.routes');
const fundRequestsRoutes = require('./fundRequests.routes');
const operatorsRoutes = require('./operators.routes');
const plansRoutes = require('./plans.routes');
const apiRoutes = require('./api.routes');
const commissionRoutes = require('./commission.routes');
const communicationRoutes = require('./communication.routes');
const contentRoutes = require('./content.routes');
const rbacRoutes = require('./rbac.routes');
const reportsRoutes = require('./reports.routes');

const verifyAdminJWT = require('../../middleware/adminAuth');

// Bind all sub-routing controllers
router.use('/', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/fund-requests', fundRequestsRoutes);
router.use('/operators', operatorsRoutes);
router.use('/plans', plansRoutes);
router.use('/api-management', apiRoutes);
router.use('/commission', commissionRoutes);
router.use('/communication', communicationRoutes);
router.use('/content', contentRoutes);
router.use('/rbac', rbacRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
