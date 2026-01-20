const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Please log in to continue' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.roles = decoded.roles;
        req.roleId = Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles;
        req.roleNames = decoded.roleNames;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again' });
    }
};

// Also export as default for backward compatibility
const authMiddleware = verifyToken;
authMiddleware.verifyToken = verifyToken;

const isAdmin = (req, res, next) => {
    // Admin role is usually 1
    if (req.roles && (req.roles.includes(1) || req.roles.includes('1'))) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
    }
};

authMiddleware.isAdmin = isAdmin;

module.exports = authMiddleware;
