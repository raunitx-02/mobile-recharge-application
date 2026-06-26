const express = require('express');
const router = express.Router();

const plansController = require('../../controllers/admin/plans.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/', hasPermission('plans:read'), plansController.getPlans);
router.post('/', hasPermission('plans:write'), validate(adminValidator.createPlan), plansController.createPlan);
router.put('/:id', hasPermission('plans:write'), plansController.updatePlan);
router.delete('/:id', hasPermission('plans:write'), plansController.deletePlan);
router.post('/bulk-upload', hasPermission('plans:write'), plansController.bulkUploadPlans);

module.exports = router;
