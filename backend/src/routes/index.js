const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const rechargeRoutes = require('./recharge.routes');
const bbpsRoutes = require('./bbps.routes');
const walletRoutes = require('./wallet.routes');
const transactionRoutes = require('./transaction.routes');
const offerRoutes = require('./offer.routes');
const notificationRoutes = require('./notification.routes');
const profileRoutes = require('./profile.routes');
const adminRoutes = require('./admin');
const kwikapiRoutes = require('./kwikapi.routes');

// Bind User flows
router.use('/auth', authRoutes);
router.use('/recharge', rechargeRoutes);
router.use('/bbps', bbpsRoutes);
router.use('/wallet', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/profile', profileRoutes);

// KwikAPI Webhook Callback (transaction status updates from KwikAPI)
router.use('/kwikapi', kwikapiRoutes);

// Bind Admin flow
router.use('/admin', adminRoutes);

module.exports = router;
