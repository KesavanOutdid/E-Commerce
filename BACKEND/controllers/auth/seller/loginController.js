const User = require('../../../models/User');
const Role = require('../../../models/Role');
const { generateAccessToken } = require('../../../utils/jwtUtils');

async function sellerLogin(req, res) {
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
        message: 'Seller not found'
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Seller access only'
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: 'Seller account is inactive'
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
        return role ? role.role_name : null;
      })
    );

    await User.updateLastLogin(user.userId);

    const access_token = generateAccessToken(user, roleNames.filter(Boolean));

    return res.status(200).json({
      success: true,
      message: 'Seller logged in successfully',
      data: {
        access_token,
        token_type: 'bearer',
        userId: user.userId,
        roles: user.roles,
        roleNames: roleNames.filter(Boolean),
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Seller login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = { sellerLogin };
