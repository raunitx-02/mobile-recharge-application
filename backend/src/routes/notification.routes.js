const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const verifyJWT = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', notificationController.getNotifications);
router.post('/read/:id', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);
router.post('/fcm-token', notificationController.updateFcmToken);

module.exports = router;
