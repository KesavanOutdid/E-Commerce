const Role = require('../../../models/Role');

async function getRoles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const roles = await Role.findAll({}, { skip, limit });
    const total = await Role.count({});

    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function createRole(req, res) {
  try {
    const { role_name } = req.body;

    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const existingRole = await Role.findByName(role_name);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const newRole = await Role.create({
      role_name,
      created_by: req.userEmail || 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });

  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateRole(req, res) {
  try {
    const { role_id } = req.params;
    const { role_name } = req.body;

    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const role = await Role.findById(parseInt(role_id));
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const updatedRole = await Role.update(parseInt(role_id), {
      role_name,
      modified_by: req.userEmail || 'admin'
    });

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole.value
    });

  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteRole(req, res) {
  try {
    const { role_id } = req.params;

    const role = await Role.findById(parseInt(role_id));
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (parseInt(role_id) <= 3) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    await Role.softDelete(parseInt(role_id), req.userEmail || 'admin');

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
