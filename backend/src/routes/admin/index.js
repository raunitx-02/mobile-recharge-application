const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

const dashboardRoutes = require('./dashboard.routes');
const usersRoutes = require('./users.routes');
const transactionsRoutes = require('./transactions.routes');
const fundRequestsRoutes = require('./fundRequests.routes');
const operatorsRoutes = require('./operators.routes');
const plansRoutes = require('./plans.routes');
const commissionRoutes = require('./commission.routes');
const reportsRoutes = require('./reports.routes');

const misc = require('../../controllers/admin/misc.controller');

// Existing sub-routes
router.use('/', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/fund-requests', fundRequestsRoutes);
router.use('/operators', operatorsRoutes);
router.use('/plans', plansRoutes);
router.use('/commission', commissionRoutes);
router.use('/commissions', commissionRoutes);
router.use('/reports', reportsRoutes);

// Settings & password
router.get('/settings', verifyAdminJWT, misc.getSettings);
router.put('/settings', verifyAdminJWT, misc.updateSettings);
router.post('/change-password', verifyAdminJWT, misc.changePassword);

// Image upload
router.post('/upload', verifyAdminJWT, upload.single('file'), misc.uploadImage);

// Notifications
router.post('/notifications/send', verifyAdminJWT, misc.sendNotification);
router.get('/notifications/logs', verifyAdminJWT, misc.getNotificationLogs);

// Banners
router.get('/banners', verifyAdminJWT, misc.getBanners);
router.post('/banners', verifyAdminJWT, misc.createBanner);
router.put('/banners/:id', verifyAdminJWT, misc.updateBanner);
router.delete('/banners/:id', verifyAdminJWT, misc.deleteBanner);

// Offers
router.get('/offers', verifyAdminJWT, misc.getOffers);
router.post('/offers', verifyAdminJWT, misc.createOffer);
router.put('/offers/:id', verifyAdminJWT, misc.updateOffer);
router.delete('/offers/:id', verifyAdminJWT, misc.deleteOffer);

// Reports (additional endpoint for misc controller)
router.get('/reports', verifyAdminJWT, misc.getReports);

module.exports = router;
