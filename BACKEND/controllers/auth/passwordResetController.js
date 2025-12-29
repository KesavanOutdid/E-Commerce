const User = require('../../models/User');
const Role = require('../../models/Role');
const PasswordResetOtp = require('../../models/PasswordResetOtp');
const { generateResetToken, verifyResetToken } = require('../../utils/jwtUtils');

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
          otp_ref: null,
          expires_in_sec: 180,
          resend_available_in_sec: 30
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
            resend_available_in_sec: Math.ceil((30000 - timeSinceCreated) / 1000)
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

    console.log(`📧 Password Reset OTP for ${email}: ${otpCode}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email if it exists',
      data: {
        otp_ref: otpRecord._id.toString(),
        expires_in_sec: 180,
        resend_available_in_sec: 30
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function validateOtp(req, res) {
  try {
    const { otp, otp_ref } = req.body;

    if (!otp || !otp_ref) {
      return res.status(400).json({
        success: false,
        message: 'OTP and OTP reference are required'
      });
    }

    const otpRecord = await PasswordResetOtp.verify(otp_ref, otp);
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const reset_token = generateResetToken({
      userId: otpRecord.userId,
      email: otpRecord.email
    });

    await PasswordResetOtp.deleteByUserId(otpRecord.userId);

    return res.status(200).json({
      success: true,
      message: 'OTP validated',
      data: {
        reset_token
      }
    });

  } catch (error) {
    console.error('Validate OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function setNewPassword(req, res) {
  try {
    const { new_password, confirm_password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Reset token required'
      });
    }

    if (!new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are required'
      });
    }

    if (new_password !== confirm_password) {
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

    await User.updatePassword(user.userId, new_password, user.email);
    await PasswordResetOtp.deleteByUserId(user.userId);

    const updatedUser = await User.findByUserId(user.userId);
    
    const roleNames = await Promise.all(
      (updatedUser.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
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
    console.error('Set new password error:', error);
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
