const express = require('express');
const router = express.Router();

const rechargeController = require('../controllers/recharge.controller');
const validate = require('../middleware/validate');
const rechargeValidator = require('../validators/recharge.validator');
const verifyJWT = require('../middleware/auth');

// Public routes for browser and mobile
router.get('/operators',          rechargeController.getOperators);
router.get('/operators/:id/plans',rechargeController.getPlans);       // legacy
router.get('/plans',              rechargeController.getPlans);        // new: ?operator=Jio&circle=Delhi NCR
router.post('/detect-operator',   validate(rechargeValidator.detectOperator), rechargeController.detectOperator);

// Protected transaction initiator
router.post('/initiate', verifyJWT, validate(rechargeValidator.initiateRecharge), rechargeController.initiateRecharge);

module.exports = router;
