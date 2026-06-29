const express = require('express');
const router = express.Router();

const walletController = require('../controllers/wallet.controller');
const validate = require('../middleware/validate');
const walletValidator = require('../validators/wallet.validator');
const verifyJWT = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', walletController.getWallet);
router.get('/history', walletController.getHistory);
router.post('/add-money/create-order', validate(walletValidator.createOrder), walletController.createOrder);
router.post('/create-order', validate(walletValidator.createOrder), walletController.createOrder);
router.post('/add-money/verify', validate(walletValidator.verifyPayment), walletController.verifyPayment);
router.post('/verify-payment', validate(walletValidator.verifyPayment), walletController.verifyPayment);
router.post('/fund-request', validate(walletValidator.fundRequest), walletController.requestFunds);
router.get('/fund-requests', walletController.getFundRequests);

module.exports = router;
