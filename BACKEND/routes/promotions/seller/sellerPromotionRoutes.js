const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const sellerCouponController = require('../../../controllers/promotions/seller/sellerCouponController');
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

module.exports = router;
