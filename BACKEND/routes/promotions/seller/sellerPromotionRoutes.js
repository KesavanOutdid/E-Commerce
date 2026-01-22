const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const sellerCouponController = require('../../../controllers/promotions/seller/sellerCouponController');
const sellerOfferController = require('../../../controllers/promotions/seller/sellerOfferController');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/promotions/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }  
});
const upload = multer({ storage: storage });

// Routes
router.post('/coupons', authMiddleware, upload.single('image'), sellerCouponController.createCoupon);
router.get('/coupons', authMiddleware, sellerCouponController.getMyCoupons);
router.get('/coupons/:id', authMiddleware, sellerCouponController.getCouponById);
router.put('/coupons/:id', authMiddleware, upload.single('image'), sellerCouponController.updateCoupon);
router.delete('/coupons/:id', authMiddleware, sellerCouponController.deleteCoupon);

// Offer Routes
router.post('/offers', authMiddleware, upload.single('image'), sellerOfferController.createOffer);
router.get('/offers', authMiddleware, sellerOfferController.getMyOffers);
router.get('/offers/:id', authMiddleware, sellerOfferController.getOfferById);
router.put('/offers/:id', authMiddleware, upload.single('image'), sellerOfferController.updateOffer);
router.delete('/offers/:id', authMiddleware, sellerOfferController.deleteOffer);

module.exports = router;
