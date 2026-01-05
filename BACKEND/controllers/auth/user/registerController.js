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

    console.log(`📧 User Registration OTP for ${email}: ${otpCode}`);
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
    console.error('User send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password, otpCode, addresses } = req.body;

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

    // Standardized address format
    let formattedAddresses = [];
    if (addresses && Array.isArray(addresses)) {
      formattedAddresses = addresses.map(addr => ({
        name: addr.name || null,
        email: addr.email || null,
        phone: addr.phone || null,
        doorNo: addr.doorNo || addr.Doorno || null,
        street: addr.street || null,
        landmark: addr.landmark || null,
        city: addr.city || null,
        district: addr.district || addr.distict || null,
        state: addr.state || null,
        country: addr.country || addr.contry || null,
        pincode: addr.pincode || null
      }));
    }

    const userId = uuidv4();
    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      email,
      phone: phone ? phone.replace(/^\+91/, '') : null,
      password,
      roles: [3],
      addresses: formattedAddresses,
      createdBy: email
    });

    await RegistrationOtp.deleteByEmail(email);

    const role = await Role.findById(3);
    const roleNames = role ? [role.roleName] : [];

    const accessToken = generateAccessToken(newUser, roleNames);

    sendWelcomeEmail(newUser.email, newUser.firstName);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        tokenType: 'bearer',
        userId: newUser.userId,
        roles: [3],
        roleNames,
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        addresses: newUser.addresses || []
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = { sendRegistrationOtp, register };
