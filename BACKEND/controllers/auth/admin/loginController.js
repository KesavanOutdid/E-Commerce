const User = require('../../../models/User');
const Role = require('../../../models/Role');
const Permission = require('../../../models/Permission');
const { generateAccessToken } = require('../../../utils/jwtUtils');
const { sendLoginNotification } = require('../../../services/emailService');

async function adminLogin(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password are required'
      });
    }

    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;

    if (!emailRegex.test(identifier) && !mobileRegex.test(identifier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or mobile format'
      });
    }

    const user = await User.findByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!user.roles || !user.roles.includes(1)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access only'
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const roleNames = await Promise.all(
      user.roles.map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    // Fetch all permissions for the user's roles
    const allPermissions = await Promise.all(
      user.roles.map(async (roleId) => {
        return await Permission.findByRole(roleId);
      })
    );

    // Flatten and merge permissions (union)
    const permissions = allPermissions.flat().reduce((acc, curr) => {
      const key = `${curr.module}_${curr.submodule || ''}`;
      if (!acc[key]) {
        acc[key] = { ...curr };
      } else {
        acc[key].canCreate = acc[key].canCreate || curr.canCreate;
        acc[key].canView = acc[key].canView || curr.canView;
        acc[key].canUpdate = acc[key].canUpdate || curr.canUpdate;
        acc[key].canDelete = acc[key].canDelete || curr.canDelete;
        acc[key].canApprove = acc[key].canApprove || curr.canApprove;
      }
      return acc;
    }, {});

    await User.updateLastLogin(user.userId);

    const accessToken = generateAccessToken(user, roleNames.filter(Boolean));

    sendLoginNotification(user.email, user.firstName, {
      time: new Date().toLocaleString(),
      ip: req.ip || req.connection.remoteAddress,
      device: req.headers['user-agent'] || 'Unknown'
    });

    return res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      data: {
        accessToken,
        tokenType: 'bearer',
        userId: user.userId,
        roles: user.roles,
        roleNames: roleNames.filter(Boolean),
        permissions: Object.values(permissions),
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = { adminLogin };
