const express = require('express');
const router = express.Router();

const fundRequestsController = require('../../controllers/admin/fundRequests.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');
const validate = require('../../middleware/validate');
const adminValidator = require('../../validators/admin.validator');

router.use(verifyAdminJWT);

router.get('/', hasPermission('wallet:credit'), fundRequestsController.getFundRequests);
router.put('/:id/approve', hasPermission('wallet:credit'), fundRequestsController.approveFundRequest);
router.put('/:id/reject', hasPermission('wallet:credit'), validate(adminValidator.fundRequestResolve), fundRequestsController.rejectFundRequest);

module.exports = router;
