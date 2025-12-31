const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const User = require('../../../models/User');
const Role = require('../../../models/Role');
const Seller = require('../../../models/Seller');
const { generateAccessToken } = require('../../../utils/jwtUtils');
const { sendWelcomeEmail, sendLoginNotification } = require('../../../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function getGoogleConfig(req, res) {
  try {
    return res.status(200).json({
      clientId: process.env.GOOGLE_CLIENT_ID
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
    const { idToken, phone } = req.body;

    if (!idToken) {
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
        idToken: idToken,
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
    const emailVerified = payload.email_verified;

    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Google email not verified'
      });
    }

    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';

    let user = await User.findByEmail(email);

    if (user) {
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

      const roleNames = await Promise.all(
        user.roles.map(async (roleId) => {
          const role = await Role.findById(roleId);
          return role ? role.roleName : null;
        })
      );

      await User.updateLastLogin(user.userId);

      const sellerInfo = await Seller.findByUserId(user.userId);
      const kycApproved = sellerInfo ? sellerInfo.kycApproved : false;

      const accessToken = generateAccessToken(user, roleNames.filter(Boolean));

      sendLoginNotification(user.email, user.firstName, {
        time: new Date().toLocaleString(),
        ip: req.ip || req.connection.remoteAddress,
        device: req.headers['user-agent'] || 'Unknown'
      });

      return res.status(200).json({
        success: true,
        message: 'Seller logged in successfully with Google',
        data: {
          accessToken,
          tokenType: 'bearer',
          userId: user.userId,
          roles: user.roles,
          roleNames: roleNames.filter(Boolean),
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          kycApproved: kycApproved
        }
      });
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
      roles: [2],
      createdBy: email
    });

    // Automatically create seller info
    const shopName = firstName ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}'s Shop` : 'New Shop';
    await Seller.create({
      userId,
      shopName,
      onboardingCompleted: false,
      isLive: false,
      kycApproved: false
    });

    const role = await Role.findById(2);
    const roleNames = role ? [role.roleName] : [];

    const accessToken = generateAccessToken(newUser, roleNames);

    sendWelcomeEmail(newUser.email, newUser.firstName);
    sendLoginNotification(newUser.email, newUser.firstName, {
      time: new Date().toLocaleString(),
      ip: req.ip || req.connection.remoteAddress,
      device: req.headers['user-agent'] || 'Unknown'
    });

    return res.status(201).json({
      success: true,
      message: 'Seller registered and logged in successfully with Google',
      data: {
        accessToken,
        tokenType: 'bearer',
        userId: newUser.userId,
        roles: newUser.roles,
        roleNames,
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        kycApproved: false
      }
    });

  } catch (error) {
    console.error('Seller Google authentication error:', error);
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
