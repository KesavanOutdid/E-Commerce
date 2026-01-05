const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { sellerLogin } = require('../../../controllers/auth/seller/loginController');
const { sendRegistrationOtp, register } = require('../../../controllers/auth/seller/registerController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/seller/passwordResetController');
const { getGoogleConfig, googleAuthentication } = require('../../../controllers/auth/seller/googleLoginController');
const { getSellerProfile, updateSellerProfile } = require('../../../controllers/auth/seller/profileController');
const { requestKyc, getKycStatus } = require('../../../controllers/auth/seller/kycController');
const upload = require('../../../middleware/profileUploadMiddleware');

router.post('/login', sellerLogin);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register', register);

router.get('/google/config', getGoogleConfig);
router.post('/google/login', googleAuthentication);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getSellerProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateSellerProfile);

router.post('/kyc/request', authMiddleware, requestKyc);
router.get('/kyc/status', authMiddleware, getKycStatus);

module.exports = router;
