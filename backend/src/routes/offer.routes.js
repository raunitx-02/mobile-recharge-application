const express = require('express');
const router = express.Router();

const offerController = require('../controllers/offer.controller');
const verifyJWT = require('../middleware/auth');

// Public offers
router.get('/', offerController.getOffers);

// Protected coupon checks & stats
router.post('/apply-coupon', verifyJWT, offerController.applyCoupon);
router.get('/referral', verifyJWT, offerController.getReferralStats);

module.exports = router;
