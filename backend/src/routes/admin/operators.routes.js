const express = require('express');
const router = express.Router();

const operatorsController = require('../../controllers/admin/operators.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/', hasPermission('operators:read'), operatorsController.getOperators);
router.post('/', hasPermission('operators:write'), validate(adminValidator.createOperator), operatorsController.createOperator);
router.put('/:id', hasPermission('operators:write'), operatorsController.updateOperator);
router.delete('/:id', hasPermission('operators:write'), operatorsController.deleteOperator);

module.exports = router;
