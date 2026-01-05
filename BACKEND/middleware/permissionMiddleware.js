const Permission = require('../models/Permission');

const checkPermission = (module, submodule, action) => {
  return async (req, res, next) => {
    try {
      // Admin (role 1) has all permissions
      if (req.roles && req.roles.includes(1)) {
        return next();
      }

      const roleId = req.roleId;
      if (!roleId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No role assigned'
        });
      }

      const hasPermission = await Permission.checkPermission(roleId, module, submodule, action);

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: You do not have permission to ${action} in ${module}${submodule ? ' -> ' + submodule : ''}`
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

module.exports = checkPermission;
