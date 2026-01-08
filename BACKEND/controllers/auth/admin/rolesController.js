const Role = require('../../../models/Role');

async function getRoles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.roleName = new RegExp(search, 'i');
    }

    const roles = await Role.findAll(query, { skip, limit });
    const total = await Role.count(query);

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

async function getRole(req, res) {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(parseInt(roleId));

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role retrieved successfully',
      data: role
    });

  } catch (error) {
    console.error('Get role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function createRole(req, res) {
  try {
    const { roleName } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    const existingRole = await Role.findByName(roleName);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const newRole = await Role.create({
      roleName,
      createdBy: req.userEmail || 'admin'
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
    const { roleId } = req.params;
    const { status } = req.body;

    const role = await Role.findById(parseInt(roleId));
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const updateData = {
      modifiedBy: req.userEmail || 'admin'
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedRole = await Role.update(parseInt(roleId), updateData);

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
    const { roleId } = req.params;

    const role = await Role.findById(parseInt(roleId));
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (parseInt(roleId) <= 3) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    await Role.softDelete(parseInt(roleId), req.userEmail || 'admin');

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
  getRole,
  createRole,
  updateRole,
  deleteRole
};
