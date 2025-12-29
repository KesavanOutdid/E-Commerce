const User = require('../../../models/User');
const Role = require('../../../models/Role');
const PasswordResetOtp = require('../../../models/PasswordResetOtp');
const { generateResetToken, verifyResetToken } = require('../../../utils/jwtUtils');
const { sendOtpEmail } = require('../../../services/emailService');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent to email if it exists',
        data: {
          otpRef: null,
          expiresInSec: 180,
          resendAvailableInSec: 30
        }
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent to email if it exists',
        data: {
          otpRef: null,
          expiresInSec: 180,
          resendAvailableInSec: 30
        }
      });
    }

    const existingOtp = await PasswordResetOtp.findByEmail(email);
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

    await PasswordResetOtp.deleteByEmail(email);

    const otpCode = generateOTP();
    const otpRecord = await PasswordResetOtp.create({
      userId: user.userId,
      email: user.email,
      otpCode
    });

    console.log(`📧 Seller Password Reset OTP for ${email}: ${otpCode}`);
    sendOtpEmail(email, otpCode, 'reset');

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email if it exists',
      data: {
        otpRef: otpRecord._id.toString(),
        expiresInSec: 180,
        resendAvailableInSec: 30
      }
    });

  } catch (error) {
    console.error('Seller forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function validateOtp(req, res) {
  try {
    const { otp, otpRef } = req.body;

    if (!otp || !otpRef) {
      return res.status(400).json({
        success: false,
        message: 'OTP and OTP reference are required'
      });
    }

    const otpRecord = await PasswordResetOtp.verify(otpRef, otp);
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const resetToken = generateResetToken({
      userId: otpRecord.userId,
      email: otpRecord.email
    });

    await PasswordResetOtp.deleteByUserId(otpRecord.userId);

    return res.status(200).json({
      success: true,
      message: 'OTP validated',
      data: {
        resetToken
      }
    });

  } catch (error) {
    console.error('Seller validate OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function setNewPassword(req, res) {
  try {
    const { newPassword, confirmPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Reset token required'
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    const user = await User.findByUserId(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Seller access only'
      });
    }

    await User.updatePassword(user.userId, newPassword, user.email);
    await PasswordResetOtp.deleteByUserId(user.userId);

    const updatedUser = await User.findByUserId(user.userId);
    
    const roleNames = await Promise.all(
      (updatedUser.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        userId: updatedUser.userId,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles || [],
        roleNames: roleNames.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Seller set new password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  forgotPassword,
  validateOtp,
  setNewPassword
};
