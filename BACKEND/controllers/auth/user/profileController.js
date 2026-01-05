const User = require('../../../models/User');
const Role = require('../../../models/Role');
const { generateAccessToken } = require('../../../utils/jwtUtils');

async function getUserProfile(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.roles || !user.roles.includes(3)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: User access only'
      });
    }

    const roleNames = await Promise.all(
      (user.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );


    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        ...user,
        roleNames: roleNames.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, profileImage, addresses } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.roles || !user.roles.includes(3)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: User access only'
      });
    }

    const updateData = {
      updatedBy: req.userEmail
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone.replace(/^\+91/, '');
    
    // Handle profileImage from file upload or body
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    // Standardized address format: doorNo, street, city, district, state, country, pincode
    if (addresses !== undefined) {
      if (Array.isArray(addresses)) {
        updateData.addresses = addresses.map(addr => ({
          doorNo: addr.doorNo || addr.Doorno || null,
          street: addr.street || null,
          city: addr.city || null,
          district: addr.district || addr.distict || null,
          state: addr.state || null,
          country: addr.country || addr.contry || null,
          pincode: addr.pincode || null
        }));
      } else {
        updateData.addresses = [];
      }
    }

    const updatedUser = await User.update(userId, updateData);

    const roleNames = await Promise.all(
      (updatedUser.value.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        ...updatedUser.value,
        roleNames: roleNames.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addRole(req, res) {
  try {
    const userId = req.userId;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'roleId is required'
      });
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.roles.includes(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'User already has this role'
      });
    }

    const roleExists = await Role.findById(roleId);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid roleId'
      });
    }

    const updatedRoles = [...user.roles, roleId];
    await User.update(userId, { 
      roles: updatedRoles,
      updatedBy: req.userEmail 
    });

    const roleNames = await Promise.all(
      updatedRoles.map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    const updatedUser = await User.findByUserId(userId);
    const accessToken = generateAccessToken(updatedUser, roleNames.filter(Boolean));

    return res.status(200).json({
      success: true,
      message: 'Role added successfully',
      data: {
        accessToken,
        tokenType: 'bearer',
        userId: updatedUser.userId,
        roles: updatedRoles,
        roleNames: roleNames.filter(Boolean),
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      }
    });

  } catch (error) {
    console.error('Add role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  addRole
};
