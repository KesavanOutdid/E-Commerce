const { v4: uuidv4 } = require('uuid');
const User = require('../../../models/User');
const Role = require('../../../models/Role');
const Seller = require('../../../models/Seller');

async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const matchStage = {};
    if (req.query.role) {
      matchStage.roles = parseInt(req.query.role);
    }
    if (req.query.status !== undefined) {
      matchStage.status = req.query.status === 'true';
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      matchStage.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'sellers',
          localField: 'userId',
          foreignField: 'userId',
          as: 'sellerInfo'
        }
      },
      { $unwind: { path: '$sellerInfo', preserveNullAndEmptyArrays: true } }
    ];

    if (req.query.kycStatus) {
      if (req.query.kycStatus === 'pending') {
        pipeline.push({
          $match: {
            roles: 2,
            $or: [
              { 'sellerInfo.kycApproved': false },
              { 'sellerInfo.kycApproved': { $exists: false } }
            ]
          }
        });
      } else if (req.query.kycStatus === 'approved') {
        pipeline.push({
          $match: {
            roles: 2,
            'sellerInfo.kycApproved': true
          }
        });
      } else if (req.query.kycStatus === 'rejected') {
        pipeline.push({
          $match: {
            roles: 2,
            'sellerInfo.kycApproved': false,
            'sellerInfo.kycRejectionReason': { $exists: true, $ne: null }
          }
        });
      }
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await User.collection().aggregate(countPipeline).toArray();
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const users = await User.collection().aggregate(pipeline).toArray();

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

async function getUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findByUserId(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const roleNames = await Promise.all(
      (user.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
      })
    );

    let sellerInfo = null;
    if (user.roles && user.roles.includes(2)) {
      sellerInfo = await Seller.findByUserId(userId);
    }

    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        ...user,
        roleNames: roleNames.filter(Boolean),
        sellerInfo
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addUser(req, res) {
  try {
    const { firstName, lastName, email, phone, password, roles, profileImage } = req.body;

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
      profileImage: req.file ? `/uploads/profiles/${req.file.filename}` : (profileImage || null),
      createdBy: req.userEmail || 'admin'
    });

    // Automatically create seller info if user has Seller role (ID 2)
    if (userRoles.includes(2)) {
      const shopName = firstName ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)}'s Shop` : 'New Shop';
      await Seller.create({
        userId,
        shopName,
        onboardingCompleted: false,
        kycApproved: false
      });
    }

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
    const { firstName, lastName, phone, roles, status, sellerInfo, profileImage } = req.body;

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
    
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }
    
    let roleNames = [];
    if (roles !== undefined) {
      let userRoles = roles;
      if (typeof roles === 'string') {
        try {
          userRoles = JSON.parse(roles);
        } catch (e) {
          userRoles = [parseInt(roles)];
        }
      }
      userRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
      
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
    
    if (status !== undefined) {
      updateData.status = typeof status === 'string' ? status === 'true' : status;
    }

    // Handle Seller Info
    let updatedSellerInfo = null;
    let finalSellerInfo = sellerInfo;
    if (typeof sellerInfo === 'string') {
      try {
        finalSellerInfo = JSON.parse(sellerInfo);
      } catch (e) {
        finalSellerInfo = null;
      }
    }

    if (finalSellerInfo) {
      const sellerUpdateData = { ...finalSellerInfo };
      
      // If kycApproved is being changed to true, set approvedBy and approvedAt
      if (finalSellerInfo.kycApproved === true || finalSellerInfo.kycApproved === 'true') {
        sellerUpdateData.kycApproved = true;
        sellerUpdateData.kycApprovedBy = req.userEmail || 'admin';
        sellerUpdateData.kycApprovedAt = new Date();
      }

      const result = await Seller.update(userId, sellerUpdateData);
      updatedSellerInfo = result.value;
    }

    // Handle Addresses
    if (req.body.addresses) {
      try {
        updateData.addresses = typeof req.body.addresses === 'string' ? JSON.parse(req.body.addresses) : req.body.addresses;
      } catch (e) {
        console.error('Error parsing addresses:', e);
      }
    }

    const updatedUser = await User.update(userId, updateData);

    if (!updatedSellerInfo && user.roles && user.roles.includes(2)) {
        updatedSellerInfo = await Seller.findByUserId(userId);
    }

    // If role updated to include Seller (ID 2), check if Seller profile exists
    if (updateData.roles && updateData.roles.includes(2)) {
      const existingSeller = await Seller.findByUserId(userId);
      if (!existingSeller) {
        const fName = updatedUser.value.firstName || '';
        const shopName = fName ? `${fName.charAt(0).toUpperCase() + fName.slice(1)}'s Shop` : 'New Shop';
        const result = await Seller.create({
          userId,
          shopName,
          onboardingCompleted: false,
          kycApproved: false
        });
        updatedSellerInfo = result;
      }
    }

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
        roleNames,
        sellerInfo: updatedSellerInfo
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

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.delete(userId);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
};
