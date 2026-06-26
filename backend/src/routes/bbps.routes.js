const express = require('express');
const router = express.Router();

const bbpsController = require('../controllers/bbps.controller');
const verifyJWT = require('../middleware/auth');

router.use(verifyJWT);

router.get('/categories', bbpsController.getCategories);
router.get('/billers', bbpsController.getBillers);
router.post('/fetch-bill', bbpsController.fetchBill);
router.post('/pay', bbpsController.payBill);

module.exports = router;
