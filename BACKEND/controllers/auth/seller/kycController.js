const User = require('../../../models/User');
const Seller = require('../../../models/Seller');

async function requestKyc(req, res) {
  try {
    const userId = req.userId;
    const { shopName, gstin, panNumber, bankDetails, shopAddress } = req.body;

    if (!shopName || !gstin || !panNumber) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: shopName, gstin, panNumber'
      });
    }

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

    const existingGstin = await Seller.findByGstin(gstin);
    if (existingGstin && existingGstin.userId !== userId) {
      return res.status(400).json({
        success: false,
        message: 'GSTIN already registered'
      });
    }

    let sellerInfo = await Seller.findByUserId(userId);

    // Standardized shop address format
    let formattedShopAddress = null;
    if (shopAddress && typeof shopAddress === 'object') {
      formattedShopAddress = {
        doorNo: shopAddress.doorNo || shopAddress.Doorno || null,
        street: shopAddress.street || null,
        city: shopAddress.city || null,
        district: shopAddress.district || shopAddress.distict || null,
        state: shopAddress.state || null,
        country: shopAddress.country || shopAddress.contry || null,
        pincode: shopAddress.pincode || null
      };
    }

    const sellerData = {
      shopName,
      gstin,
      panNumber,
      bankDetails,
      shopAddress: formattedShopAddress,
      kycApproved: false,
      onboardingCompleted: true
    };

    if (sellerInfo) {
      await Seller.update(userId, sellerData);
    } else {
      await Seller.create({
        userId: userId,
        ...sellerData
      });
    }

    sellerInfo = await Seller.findByUserId(userId);

    return res.status(200).json({
      success: true,
      message: 'KYC request submitted successfully. Awaiting admin approval.',
      data: sellerInfo
    });

  } catch (error) {
    console.error('Request KYC error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getKycStatus(req, res) {
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

    const sellerInfo = await Seller.findByUserId(userId);

    if (!sellerInfo) {
      return res.status(200).json({
        success: true,
        message: 'No KYC request found',
        data: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          kycApproved: false,
          onboardingCompleted: false,
          isLive: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'KYC status retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        shopName: sellerInfo.shopName,
        gstin: sellerInfo.gstin,
        panNumber: sellerInfo.panNumber,
        bankDetails: sellerInfo.bankDetails,
        shopAddress: sellerInfo.shopAddress,
        kycApproved: sellerInfo.kycApproved,
        kycApprovedBy: sellerInfo.kycApprovedBy,
        kycApprovedAt: sellerInfo.kycApprovedAt,
        onboardingCompleted: sellerInfo.onboardingCompleted,
        isLive: sellerInfo.isLive,
        commissionPercentage: sellerInfo.commissionPercentage,
        goLiveApprovedBy: sellerInfo.goLiveApprovedBy,
        goLiveApprovedAt: sellerInfo.goLiveApprovedAt
      }
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  requestKyc,
  getKycStatus
};
