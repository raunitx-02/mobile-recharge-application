const express = require('express');
const router = express.Router();

const commissionController = require('../../controllers/admin/commission.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/', hasPermission('commissions:read'), commissionController.getCommissions);
router.post('/', hasPermission('commissions:write'), validate(adminValidator.createCommission), commissionController.createCommission);
router.put('/:id', hasPermission('commissions:write'), commissionController.updateCommission);
router.delete('/:id', hasPermission('commissions:write'), commissionController.deleteCommission);

module.exports = router;
