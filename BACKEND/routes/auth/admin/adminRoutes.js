const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { adminLogin } = require('../../../controllers/auth/admin/loginController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/admin/passwordResetController');
const { getUsers, getUser, addUser, updateUser, deleteUser } = require('../../../controllers/auth/admin/usersController');
const { getRoles, getRole, createRole, updateRole, deleteRole } = require('../../../controllers/auth/admin/rolesController');
const { getAdminProfile, updateAdminProfile } = require('../../../controllers/auth/admin/profileController');
const { updateCommission } = require('../../../controllers/auth/admin/kycController');

router.post('/login', adminLogin);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, updateAdminProfile);

router.get('/users', authMiddleware, getUsers);
router.get('/users/:userId', authMiddleware, getUser);
router.post('/users', authMiddleware, addUser);
router.put('/users/:userId', authMiddleware, updateUser);
router.delete('/users/:userId', authMiddleware, deleteUser);

router.get('/roles', authMiddleware, getRoles);
router.get('/roles/:roleId', authMiddleware, getRole);
router.post('/roles', authMiddleware, createRole);
router.put('/roles/:roleId', authMiddleware, updateRole);
router.delete('/roles/:roleId', authMiddleware, deleteRole);

router.put('/seller/:userId/commission', authMiddleware, updateCommission);

router.get('/test-route', (req, res) => res.json({ success: true, message: 'Admin router is working' }));

module.exports = router;
