const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const RESET_TOKEN_EXPIRES_IN = '5m';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

function generateResetToken(payload) {
  return jwt.sign(
    { ...payload, type: 'reset', sub: 'password_reset' },
    JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

function verifyResetToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset' || decoded.sub !== 'password_reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
}

function generateAccessToken(user, roleNames) {
  return generateToken({
    userId: user.userId,
    email: user.email,
    roles: user.roles,
    roleNames: Array.isArray(roleNames) ? roleNames : [roleNames]
  });
}

module.exports = {
  generateToken,
  generateResetToken,
  verifyToken,
  verifyResetToken,
  generateAccessToken
};
