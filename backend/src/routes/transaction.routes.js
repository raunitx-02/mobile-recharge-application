const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');
const verifyJWT = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionDetail);

module.exports = router;
