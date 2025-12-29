const express = require('express');
const router = express.Router();
const { sendRegistrationOtp, register } = require('../../controllers/auth/registerController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../controllers/auth/passwordResetController');
const { getGoogleConfig, googleAuthentication } = require('../../controllers/auth/googleLoginController');

router.post('/register/send-otp', sendRegistrationOtp);
router.post('/register', register);

router.get('/google/config', getGoogleConfig);
router.post('/google/login', googleAuthentication);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

module.exports = router;
