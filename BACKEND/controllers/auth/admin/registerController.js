const { v4: uuidv4 } = require('uuid');
const User = require('../../../models/User');
const Role = require('../../../models/Role');
const RegistrationOtp = require('../../../models/RegistrationOtp');
const { generateAccessToken } = require('../../../utils/jwtUtils');
const { sendOtpEmail, sendWelcomeEmail } = require('../../../services/emailService');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendRegistrationOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const existingOtp = await RegistrationOtp.findByEmail(email);
    if (existingOtp) {
      const timeSinceCreated = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreated < 30000) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP',
          data: {
            resendAvailableInSec: Math.ceil((30000 - timeSinceCreated) / 1000)
          }
        });
      }
    }

    await RegistrationOtp.deleteByEmail(email);

    const otpCode = generateOTP();
    const otpRecord = await RegistrationOtp.create({
      email,
      otpCode
    });

    console.log(`📧 Admin Registration OTP for ${email}: ${otpCode}`);
    sendOtpEmail(email, otpCode, 'verification');

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: {
        email,
        expiresInSec: 180,
        resendAvailableInSec: 30
      }
    });

  } catch (error) {
    console.error('Admin send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password, otpCode } = req.body;

    if (!firstName || !lastName || !email || !password || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstName, lastName, email, password, otpCode'
      });
    }

    const otpRecord = await RegistrationOtp.verify(email, otpCode);
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (phone) {
      const existingPhone = await User.findByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    const userId = uuidv4();
    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      email,
      phone: phone ? phone.replace(/^\+91/, '') : null,
      password,
      roles: [1],
      createdBy: email
    });

    await RegistrationOtp.deleteByEmail(email);

    const role = await Role.findById(1);
    const roleNames = role ? [role.roleName] : [];

    const accessToken = generateAccessToken(newUser, roleNames);

    sendWelcomeEmail(newUser.email, newUser.firstName);

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        accessToken,
        tokenType: 'bearer',
        userId: newUser.userId,
        roles: [1],
        roleNames,
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = { sendRegistrationOtp, register };
