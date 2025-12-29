const { v4: uuidv4 } = require('uuid');
const User = require('../../../models/User');
const Role = require('../../../models/Role');

async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.roles = parseInt(req.query.role);
    }
    if (req.query.status !== undefined) {
      filter.status = req.query.status === 'true';
    }

    const users = await User.findAll(filter, { skip, limit });
    const total = await User.count(filter);

    const usersWithRoleNames = await Promise.all(
      users.map(async (user) => {
        const roleNames = await Promise.all(
          (user.roles || []).map(async (roleId) => {
            const role = await Role.findById(roleId);
            return role ? role.roleName : null;
          })
        );
        delete user.password;
        return {
          ...user,
          roleNames: roleNames.filter(Boolean)
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: usersWithRoleNames,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addUser(req, res) {
  try {
    const { firstName, lastName, email, phone, password, roles } = req.body;

    if (!firstName || !lastName || !email || !password || !roles) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstName, lastName, email, password, roles'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (phone) {
      const existingPhone = await User.findByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone already exists'
        });
      }
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    const roleNames = [];
    for (const roleId of userRoles) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: `Invalid roleId: ${roleId}`
        });
      }
      roleNames.push(roleExists.roleName);
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
      createdBy: req.userEmail || 'admin'
    });

    delete newUser.password;

    return res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: {
        ...newUser,
        roleNames
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, roles, status } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {
      updatedBy: req.userEmail || 'admin'
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone.replace(/^\+91/, '');
    
    let roleNames = [];
    if (roles !== undefined) {
      const userRoles = Array.isArray(roles) ? roles : [roles];
      for (const roleId of userRoles) {
        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
          return res.status(400).json({
            success: false,
            message: `Invalid roleId: ${roleId}`
          });
        }
        roleNames.push(roleExists.roleName);
      }
      updateData.roles = userRoles;
    }
    
    if (status !== undefined) updateData.status = status;

    const updatedUser = await User.update(userId, updateData);

    if (roles === undefined && updatedUser.value.roles) {
      roleNames = await Promise.all(
        updatedUser.value.roles.map(async (roleId) => {
          const role = await Role.findById(roleId);
          return role ? role.roleName : null;
        })
      );
      roleNames = roleNames.filter(Boolean);
    }

    delete updatedUser.value.password;

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        ...updatedUser.value,
        roleNames
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getUsers,
  addUser,
  updateUser
};
