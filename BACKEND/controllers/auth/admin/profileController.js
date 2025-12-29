const User = require('../../../models/User');
const Role = require('../../../models/Role');

async function getAdminProfile(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!user.roles || !user.roles.includes(1)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access only'
      });
    }

    const roleNames = await Promise.all(
      (user.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
      })
    );

    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        ...user,
        roleNames: roleNames.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateAdminProfile(req, res) {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, profileImage } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!user.roles || !user.roles.includes(1)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access only'
      });
    }

    const updateData = {
      updatedBy: req.userEmail
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone.replace(/^\+91/, '');
    if (profileImage) updateData.profileImage = profileImage;

    const updatedUser = await User.update(userId, updateData);

    const roleNames = await Promise.all(
      (updatedUser.value.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
      })
    );

    delete updatedUser.value.password;

    return res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        ...updatedUser.value,
        roleNames: roleNames.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getAdminProfile,
  updateAdminProfile
};
