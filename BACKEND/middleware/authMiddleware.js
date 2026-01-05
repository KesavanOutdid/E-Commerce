const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

module.exports = (req, res, next) => {
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
