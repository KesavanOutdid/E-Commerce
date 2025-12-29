const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { sellerLogin } = require('../../../controllers/auth/seller/loginController');
const { getSellerProfile, updateSellerProfile } = require('../../../controllers/auth/seller/profileController');
const { requestKyc, getKycStatus } = require('../../../controllers/auth/seller/kycController');

router.post('/login', sellerLogin);

router.get('/profile', authMiddleware, getSellerProfile);
router.put('/profile', authMiddleware, updateSellerProfile);

router.post('/kyc/request', authMiddleware, requestKyc);
router.get('/kyc/status', authMiddleware, getKycStatus);

module.exports = router;
