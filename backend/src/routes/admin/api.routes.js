const express = require('express');
const router = express.Router();

const apiController = require('../../controllers/admin/api.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/configs', hasPermission('api:read'), apiController.getApiConfigs);
router.post('/configs', hasPermission('api:write'), validate(adminValidator.createApiConfig), apiController.createApiConfig);
router.put('/configs/:id', hasPermission('api:write'), apiController.updateApiConfig);
router.delete('/configs/:id', hasPermission('api:write'), apiController.deleteApiConfig);
router.post('/configs/:id/test', hasPermission('api:write'), apiController.testApiConnection);
router.get('/configs/:id/balance', hasPermission('api:read'), apiController.getApiBalance);
router.put('/configs/:id/toggle', hasPermission('api:write'), apiController.toggleApiSwitch);

router.get('/switching', hasPermission('api:switch'), apiController.getApiSwitchingRules);
router.put('/switching', hasPermission('api:switch'), validate(adminValidator.updateApiSwitching), apiController.updateApiSwitchingRules);

router.get('/logs', hasPermission('api:read'), apiController.getApiLogs);

module.exports = router;
