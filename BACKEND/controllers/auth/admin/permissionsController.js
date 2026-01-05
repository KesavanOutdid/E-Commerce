const Permission = require('../../../models/Permission');
const Role = require('../../../models/Role');
const MODULE_CONFIG = require('../../../config/moduleConfig');

async function getModuleConfig(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: MODULE_CONFIG
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function getRolePermissions(req, res) {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(parseInt(roleId));

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const permissions = await Permission.findByRole(parseInt(roleId));

    return res.status(200).json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: permissions
    });

  } catch (error) {
    console.error('Get role permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateRolePermissions(req, res) {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body; // Array of permission objects

    const role = await Role.findById(parseInt(roleId));
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    const results = await Permission.bulkUpsert(parseInt(roleId), permissions);

    return res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      data: results
    });

  } catch (error) {
    console.error('Update role permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getModuleConfig,
  getRolePermissions,
  updateRolePermissions
};
