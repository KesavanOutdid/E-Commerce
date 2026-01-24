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
        return role ? role.roleName : null;
      })
    );

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
    const { firstName, lastName, phone, profileImage, addresses, password } = req.body;

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

    // Handle password update if requested
    if (password && user.password === password) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password'
      });
    }

    const updateData = {
      updatedBy: req.userEmail
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone.replace(/^\+91/, '');
    if (password) updateData.password = password;
    
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    // Standardized address format
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

    const result = await User.update(userId, updateData);
    const updatedUser = result.value;

    const roleNames = await Promise.all(
      (updatedUser.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        ...updatedUser,
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
