const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const checkPermission = require('../../../middleware/permissionMiddleware');
const { adminLogin } = require('../../../controllers/auth/admin/loginController');
const { forgotPassword, validateOtp, setNewPassword } = require('../../../controllers/auth/admin/passwordResetController');
const { getUsers, getUser, addUser, updateUser, deleteUser } = require('../../../controllers/auth/admin/usersController');
const { getRoles, getRole, createRole, updateRole, deleteRole } = require('../../../controllers/auth/admin/rolesController');
const { getModuleConfig, getRolePermissions, updateRolePermissions } = require('../../../controllers/auth/admin/permissionsController');
const { getAdminProfile, updateAdminProfile } = require('../../../controllers/auth/admin/profileController');
const { getKycRequests, getKycRequestDetails, updateKycStatus, updateCommission } = require('../../../controllers/auth/admin/kycController');
const upload = require('../../../middleware/profileUploadMiddleware');

router.post('/login', adminLogin);

router.post('/forgot-password', forgotPassword);
router.post('/validate-otp', validateOtp);
router.post('/set-new-password', setNewPassword);

router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateAdminProfile);

router.get('/users', authMiddleware, checkPermission('Users', null, 'view'), getUsers);
router.get('/users/:userId', authMiddleware, checkPermission('Users', null, 'view'), getUser);
router.post('/users', authMiddleware, checkPermission('Users', null, 'create'), upload.single('profileImage'), addUser);
router.put('/users/:userId', authMiddleware, checkPermission('Users', null, 'update'), upload.single('profileImage'), updateUser);
router.delete('/users/:userId', authMiddleware, checkPermission('Users', null, 'delete'), deleteUser);

router.get('/roles', authMiddleware, checkPermission('Roles', null, 'view'), getRoles);
router.get('/roles/:roleId', authMiddleware, checkPermission('Roles', null, 'view'), getRole);
router.post('/roles', authMiddleware, checkPermission('Roles', null, 'create'), createRole);
router.put('/roles/:roleId', authMiddleware, checkPermission('Roles', null, 'update'), updateRole);
router.delete('/roles/:roleId', authMiddleware, checkPermission('Roles', null, 'delete'), deleteRole);
router.get('/permissions/modules', authMiddleware, getModuleConfig);
router.get('/roles/:roleId/permissions', authMiddleware, getRolePermissions);
router.post('/roles/:roleId/permissions', authMiddleware, updateRolePermissions);

router.put('/seller/:userId/commission', authMiddleware, updateCommission);

// Seller KYC Management
router.get('/sellers/kyc', authMiddleware, getKycRequests);
router.get('/sellers/kyc/:userId', authMiddleware, getKycRequestDetails);
router.put('/sellers/kyc/:userId/status', authMiddleware, updateKycStatus);

router.get('/test-route', (req, res) => res.json({ success: true, message: 'Admin router is working' }));

module.exports = router;
