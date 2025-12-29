const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { userLogin } = require('../../../controllers/auth/user/loginController');
const { getUserProfile, updateUserProfile, addRole } = require('../../../controllers/auth/user/profileController');

router.post('/login', userLogin);

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.post('/add-role', authMiddleware, addRole);

module.exports = router;
