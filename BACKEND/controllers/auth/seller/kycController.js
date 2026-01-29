const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const NotificationService = require('../../../services/notificationService');

async function requestKyc(req, res) {
  try {
    const userId = req.userId;
    let { shopName, gstin, panNumber, bankDetails, shopAddress, shopLogo } = req.body;

    // Parse nested objects from FormData
    if (req.body['shopAddress[doorNo]']) {
      shopAddress = {
        doorNo: req.body['shopAddress[doorNo]'],
        street: req.body['shopAddress[street]'],
        landmark: req.body['shopAddress[landmark]'],
        city: req.body['shopAddress[city]'],
        district: req.body['shopAddress[district]'] || null,
        state: req.body['shopAddress[state]'],
        country: req.body['shopAddress[country]'],
        pincode: req.body['shopAddress[pincode]'],
      };
    }

    if (req.body['bankDetails[accountNumber]']) {
      bankDetails = {
        accountNumber: req.body['bankDetails[accountNumber]'],
        ifscCode: req.body['bankDetails[ifscCode]'],
        accountHolderName: req.body['bankDetails[accountHolderName]'],
        bankName: req.body['bankDetails[bankName]'],
      };
    }

    let finalShopLogo = shopLogo;
    if (req.file) {
      finalShopLogo = `/uploads/shops/${req.file.filename}`;
    }

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
        landmark: shopAddress.landmark || null,
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
      shopLogo: finalShopLogo || null,
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

    // Notify Admin about new KYC request
    await NotificationService.notifyAdminKYCRequest(userId, shopName);

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
          onboardingCompleted: false
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
        shopLogo: sellerInfo.shopLogo,
        kycApproved: sellerInfo.kycApproved,
        kycApprovedBy: sellerInfo.kycApprovedBy,
        kycApprovedAt: sellerInfo.kycApprovedAt,
        onboardingCompleted: sellerInfo.onboardingCompleted,
        commissionPercentage: sellerInfo.commissionPercentage
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
