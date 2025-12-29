const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User');
const Role = require('../../models/Role');
const RegistrationOtp = require('../../models/RegistrationOtp');
const { generateAccessToken } = require('../../utils/jwtUtils');

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
            resend_available_in_sec: Math.ceil((30000 - timeSinceCreated) / 1000)
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

    console.log(`📧 Registration OTP for ${email}: ${otpCode}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: {
        email,
        expires_in_sec: 180,
        resend_available_in_sec: 30
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password, otpCode, roles } = req.body;

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
    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      email,
      phone: phone ? phone.replace(/^\+91/, '') : null,
      password,
      roles: userRoles,
      createdBy: email
    });

    await RegistrationOtp.deleteByEmail(email);

    const roleNames = await Promise.all(
      userRoles.map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
      })
    );

    const access_token = generateAccessToken(newUser, roleNames.filter(Boolean));

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        access_token,
        token_type: 'bearer',
        userId: newUser.userId,
        roles: userRoles,
        roleNames: roleNames.filter(Boolean),
        email: newUser.email,
        phone: newUser.phone,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = { sendRegistrationOtp, register };
