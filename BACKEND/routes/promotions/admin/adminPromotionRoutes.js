const express = require('express');
const router = express.Router();
const offerController = require('../../../controllers/promotions/admin/adminOfferController');
const couponController = require('../../../controllers/promotions/admin/adminCouponController');
const { verifyToken, isAdmin } = require('../../../middleware/authMiddleware');

// Offer Routes
router.post('/offers', verifyToken, isAdmin, offerController.createOffer);
router.get('/offers', verifyToken, isAdmin, offerController.getAllOffers);
router.get('/offers/:id', verifyToken, isAdmin, offerController.getOfferById);
router.put('/offers/:id', verifyToken, isAdmin, offerController.updateOffer);
router.delete('/offers/:id', verifyToken, isAdmin, offerController.deleteOffer);

// Coupon Routes
router.post('/coupons', verifyToken, isAdmin, couponController.createCoupon);
router.get('/coupons', verifyToken, isAdmin, couponController.getAllCoupons);
router.get('/coupons/:id', verifyToken, isAdmin, couponController.getCouponById);
router.put('/coupons/:id', verifyToken, isAdmin, couponController.updateCoupon);
router.delete('/coupons/:id', verifyToken, isAdmin, couponController.deleteCoupon);

module.exports = router;
