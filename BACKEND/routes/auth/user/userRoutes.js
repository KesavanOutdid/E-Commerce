const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { userLogin } = require('../../../controllers/auth/user/loginController');
const { sendRegistrationOtp, register } = require('../../../controllers/auth/user/registerController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/user/passwordResetController');
const { getGoogleConfig, googleAuthentication } = require('../../../controllers/auth/user/googleLoginController');
const { getUserProfile, updateUserProfile, addRole } = require('../../../controllers/auth/user/profileController');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../../../controllers/auth/user/addressController');
const upload = require('../../../middleware/profileUploadMiddleware');

router.post('/login', userLogin);
router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register', register);

router.get('/google/config', getGoogleConfig);
router.post('/google/login', googleAuthentication);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateUserProfile);
router.post('/add-role', authMiddleware, addRole);

// Address routes
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:index', authMiddleware, updateAddress);
router.delete('/addresses/:index', authMiddleware, deleteAddress);

module.exports = router;
