const User = require('../../../models/User');
const Role = require('../../../models/Role');
const Seller = require('../../../models/Seller');

async function getSellerProfile(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Seller access only'
      });
    }

    let sellerInfo = await Seller.findByUserId(userId);

    if (!sellerInfo) {
      sellerInfo = await Seller.create({
        userId: userId,
        shopName: null,
        gstin: null,
        panNumber: null,
        bankDetails: null,
        kycApproved: false,
        isLive: false,
        onboardingCompleted: false
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
      message: 'Seller profile retrieved successfully',
      data: {
        ...user,
        roleNames: roleNames.filter(Boolean),
        sellerInfo
      }
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateSellerProfile(req, res) {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, profileImage, shopName, gstin, panNumber, bankDetails } = req.body;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Seller access only'
      });
    }

    const userUpdateData = {
      updatedBy: req.userEmail
    };
    if (firstName) userUpdateData.firstName = firstName;
    if (lastName) userUpdateData.lastName = lastName;
    if (phone) userUpdateData.phone = phone.replace(/^\+91/, '');
    if (profileImage) userUpdateData.profileImage = profileImage;

    await User.update(userId, userUpdateData);

    let sellerInfo = await Seller.findByUserId(userId);

    if (shopName || gstin || panNumber || bankDetails) {
      const sellerUpdateData = {};
      if (shopName) sellerUpdateData.shopName = shopName;
      if (gstin) sellerUpdateData.gstin = gstin;
      if (panNumber) sellerUpdateData.panNumber = panNumber;
      if (bankDetails) sellerUpdateData.bankDetails = bankDetails;

      if (sellerInfo) {
        await Seller.update(userId, sellerUpdateData);
      } else {
        await Seller.create({
          userId: userId,
          ...sellerUpdateData
        });
      }
      sellerInfo = await Seller.findByUserId(userId);
    }

    const updatedUser = await User.findByUserId(userId);
    
    const roleNames = await Promise.all(
      (updatedUser.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.role_name : null;
      })
    );

    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'Seller profile updated successfully',
      data: {
        ...updatedUser,
        roleNames: roleNames.filter(Boolean),
        sellerInfo
      }
    });

  } catch (error) {
    console.error('Update seller profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getSellerProfile,
  updateSellerProfile
};
