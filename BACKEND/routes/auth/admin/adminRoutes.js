const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { adminLogin } = require('../../../controllers/auth/admin/loginController');
const { getUsers, addUser, updateUser } = require('../../../controllers/auth/admin/usersController');
const { getRoles, createRole, updateRole, deleteRole } = require('../../../controllers/auth/admin/rolesController');
const { getAdminProfile, updateAdminProfile } = require('../../../controllers/auth/admin/profileController');
const { getKycRequests, getKycRequestDetails, updateKycStatus, updateCommission } = require('../../../controllers/auth/admin/kycController');

router.post('/login', adminLogin);

router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, updateAdminProfile);

router.get('/users', authMiddleware, getUsers);
router.post('/users', authMiddleware, addUser);
router.put('/users/:userId', authMiddleware, updateUser);

router.get('/roles', authMiddleware, getRoles);
router.post('/roles', authMiddleware, createRole);
router.put('/roles/:role_id', authMiddleware, updateRole);
router.delete('/roles/:role_id', authMiddleware, deleteRole);

router.get('/kyc', authMiddleware, getKycRequests);
router.get('/kyc/:userId', authMiddleware, getKycRequestDetails);
router.put('/kyc/:userId', authMiddleware, updateKycStatus);
router.put('/seller/:userId/commission', authMiddleware, updateCommission);

module.exports = router;
