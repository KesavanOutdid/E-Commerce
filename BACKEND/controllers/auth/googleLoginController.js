const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/User');
const Role = require('../../models/Role');
const { generateAccessToken } = require('../../utils/jwtUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function getGoogleConfig(req, res) {
  try {
    return res.status(200).json({
      client_id: process.env.GOOGLE_CLIENT_ID
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Google config',
      error: error.message
    });
  }
}

async function googleAuthentication(req, res) {
  try {
    const { id_token, phone, roles } = req.body;

    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google Client ID not configured'
      });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    const email = payload.email;
    const email_verified = payload.email_verified;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    let user = await User.findByEmail(email);

    if (user) {
      if (!user.status) {
        return res.status(403).json({
          success: false,
          message: 'User account is inactive'
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
        message: 'User logged in successfully with Google',
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
    }

    const userRoles = Array.isArray(roles) ? roles : [3];
    
    for (const roleId of userRoles) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: `Invalid role_id: ${roleId}`
        });
      }
    }

    const userId = uuidv4();
    const generatedPassword = uuidv4();

    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      email,
      phone: phone ? phone.replace(/^\+91/, '') : null,
      password: generatedPassword,
      roles: userRoles,
      createdBy: email
    });

    const roleNames = await Promise.all(
      userRoles.map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
      })
    );

    const access_token = generateAccessToken(newUser, roleNames.filter(Boolean));

    return res.status(201).json({
      success: true,
      message: 'User registered and logged in successfully with Google',
      data: {
        access_token,
        token_type: 'bearer',
        userId: newUser.userId,
        roles: newUser.roles,
        roleNames: roleNames.filter(Boolean),
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getGoogleConfig,
  googleAuthentication
};
