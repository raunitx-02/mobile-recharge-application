const express = require('express');
const router = express.Router();

const contentController = require('../../controllers/admin/content.controller');
const verifyAdminJWT = require('../../middleware/adminAuth');
const { hasPermission } = require('../../middleware/rbac');

router.use(verifyAdminJWT);

router.get('/banners', hasPermission('content:read'), contentController.getBanners);
router.post('/banners', hasPermission('content:write'), contentController.createBanner);
router.put('/banners/:id', hasPermission('content:write'), contentController.updateBanner);
router.delete('/banners/:id', hasPermission('content:write'), contentController.deleteBanner);

router.get('/offers', hasPermission('content:read'), contentController.getOffers);
router.post('/offers', hasPermission('content:write'), contentController.createOffer);

router.get('/coupons', hasPermission('content:read'), contentController.getCoupons);
router.post('/coupons', hasPermission('content:write'), contentController.createCoupon);

module.exports = router;
