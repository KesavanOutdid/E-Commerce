const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { sellerLogin } = require('../../../controllers/auth/seller/loginController');
const { sendRegistrationOtp, register } = require('../../../controllers/auth/seller/registerController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/seller/passwordResetController');
const { getGoogleConfig, googleAuthentication } = require('../../../controllers/auth/seller/googleLoginController');
const { getSellerProfile, updateSellerProfile } = require('../../../controllers/auth/seller/profileController');
const { requestKyc, getKycStatus } = require('../../../controllers/auth/seller/kycController');
const { addPickupAddress, getPickupAddresses, updatePickupAddress, removePickupAddress } = require('../../../controllers/auth/pickupAddressController');
const upload = require('../../../middleware/profileUploadMiddleware');
const shopUpload = require('../../../middleware/shopUploadMiddleware');

router.post('/login', sellerLogin);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register', register);

router.get('/google/config', getGoogleConfig);
router.post('/google/login', googleAuthentication);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getSellerProfile);
router.put('/profile', authMiddleware, shopUpload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'shopLogo', maxCount: 1 }]), updateSellerProfile);

// Pickup Address Management
router.post('/pickup-addresses', authMiddleware, addPickupAddress);
router.get('/pickup-addresses', authMiddleware, getPickupAddresses);
router.put('/pickup-addresses/:addressId', authMiddleware, updatePickupAddress);
router.delete('/pickup-addresses/:addressId', authMiddleware, removePickupAddress);

router.post('/kyc/request', authMiddleware, shopUpload.single('shopLogo'), requestKyc);
router.get('/kyc/status', authMiddleware, getKycStatus);

module.exports = router;
