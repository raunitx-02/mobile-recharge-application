const express = require('express');
const router = express.Router();

const communicationController = require('../../controllers/admin/communication.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);

router.get('/sms', hasPermission('content:read'), communicationController.getSmsConfig);
router.put('/sms', hasPermission('content:write'), communicationController.updateSmsConfig);

router.get('/email', hasPermission('content:read'), communicationController.getEmailConfig);
router.put('/email', hasPermission('content:write'), communicationController.updateEmailConfig);

router.get('/gateway', hasPermission('content:read'), communicationController.getGatewayConfig);
router.put('/gateway', hasPermission('content:write'), communicationController.updateGatewayConfig);

module.exports = router;
