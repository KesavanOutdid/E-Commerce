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
        return role ? role.roleName : null;
      })
    );

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
    const { 
      firstName, lastName, phone, profileImage, addresses,
      shopName, gstin, panNumber, bankDetails, shopAddress 
    } = req.body;

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
    
    if (req.file) {
      userUpdateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (profileImage !== undefined) {
      userUpdateData.profileImage = profileImage;
    }

    // Standardized personal addresses (User object)
    if (addresses !== undefined) {
      if (Array.isArray(addresses)) {
        userUpdateData.addresses = addresses.map(addr => ({
          doorNo: addr.doorNo || addr.Doorno || null,
          street: addr.street || null,
          city: addr.city || null,
          district: addr.district || addr.distict || null,
          state: addr.state || null,
          country: addr.country || addr.contry || null,
          pincode: addr.pincode || null
        }));
      } else {
        userUpdateData.addresses = [];
      }
    }

    const result = await User.update(userId, userUpdateData);
    const updatedUser = result.value;

    let sellerInfo = await Seller.findByUserId(userId);

    const sellerUpdateData = {};
    if (shopName) sellerUpdateData.shopName = shopName;
    if (gstin) sellerUpdateData.gstin = gstin;
    if (panNumber) sellerUpdateData.panNumber = panNumber;
    if (bankDetails) sellerUpdateData.bankDetails = bankDetails;

    // Standardized shop address (Seller object)
    if (shopAddress !== undefined) {
      if (shopAddress && typeof shopAddress === 'object') {
        sellerUpdateData.shopAddress = {
          doorNo: shopAddress.doorNo || shopAddress.Doorno || null,
          street: shopAddress.street || null,
          city: shopAddress.city || null,
          district: shopAddress.district || shopAddress.distict || null,
          state: shopAddress.state || null,
          country: shopAddress.country || shopAddress.contry || null,
          pincode: shopAddress.pincode || null
        };
      } else {
        sellerUpdateData.shopAddress = null;
      }
    }

    if (Object.keys(sellerUpdateData).length > 0) {
      if (sellerInfo) {
        const sellerResult = await Seller.update(userId, sellerUpdateData);
        sellerInfo = sellerResult.value;
      } else {
        sellerInfo = await Seller.create({
          userId: userId,
          ...sellerUpdateData
        });
      }
    }

    const roleNames = await Promise.all(
      (updatedUser.roles || []).map(async (roleId) => {
        const role = await Role.findById(roleId);
        return role ? role.roleName : null;
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
