const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { adminLogin } = require('../../../controllers/auth/admin/loginController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/admin/passwordResetController');
const { getUsers, addUser, updateUser } = require('../../../controllers/auth/admin/usersController');
const { getRoles, createRole, updateRole, deleteRole } = require('../../../controllers/auth/admin/rolesController');
const { getAdminProfile, updateAdminProfile } = require('../../../controllers/auth/admin/profileController');
const { updateCommission } = require('../../../controllers/auth/admin/kycController');

router.post('/login', adminLogin);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, updateAdminProfile);

router.get('/users', authMiddleware, getUsers);
router.post('/users', authMiddleware, addUser);
router.put('/users/:userId', authMiddleware, updateUser);

router.get('/roles', authMiddleware, getRoles);
router.post('/roles', authMiddleware, createRole);
router.put('/roles/:roleId', authMiddleware, updateRole);
router.delete('/roles/:roleId', authMiddleware, deleteRole);

router.put('/seller/:userId/commission', authMiddleware, updateCommission);

module.exports = router;
