const express = require('express');
const router = express.Router();
const websitePromotionController = require('../../../controllers/promotions/website/websitePromotionController');

router.get('/offers', websitePromotionController.getActiveOffers);
router.get('/offers/product/:productId', websitePromotionController.getOffersByProduct);
router.get('/coupons', websitePromotionController.getActiveCoupons);
router.get('/coupons/product/:productId', websitePromotionController.getCouponsByProduct);
router.post('/coupons/verify', websitePromotionController.verifyCoupon);

module.exports = router;
