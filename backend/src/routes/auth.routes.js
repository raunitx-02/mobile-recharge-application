const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidator = require('../validators/auth.validator');
const verifyJWT = require('../middleware/auth');
const { otpLimiter } = require('../middleware/rateLimit');

router.post('/send-otp', otpLimiter, validate(authValidator.sendOTP), authController.sendOTP);
router.post('/verify-otp', validate(authValidator.verifyOTP), authController.verifyOTP);
router.post('/login', validate(authValidator.login), authController.login);
router.post('/register', validate(authValidator.register), authController.register);
router.post('/refresh-token', authController.refreshSessionToken);

// Protected logout
router.post('/logout', verifyJWT, authController.logout);

module.exports = router;
