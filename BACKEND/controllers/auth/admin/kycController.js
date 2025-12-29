const User = require('../../../models/User');
const Seller = require('../../../models/Seller');

async function getKycRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    let filter = { onboardingCompleted: true };

    if (status === 'pending') {
      filter.kycApproved = false;
    } else if (status === 'pending-golive') {
      filter.kycApproved = true;
      filter.isLive = false;
    } else if (req.query.kycApproved !== undefined) {
      filter.kycApproved = req.query.kycApproved === 'true';
    }

    const sellers = await Seller.findAll(filter, { skip, limit });
    const total = await Seller.count(filter);

    const sellersWithUserInfo = await Promise.all(
      sellers.map(async (seller) => {
        const user = await User.findByUserId(seller.userId);
        return {
          ...seller,
          user: {
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            phone: user?.phone
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'KYC requests retrieved successfully',
      data: sellersWithUserInfo,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get KYC requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getKycRequestDetails(req, res) {
  try {
    const { userId } = req.params;

    const seller = await Seller.findByUserId(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller KYC request not found'
      });
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'KYC request details retrieved successfully',
      data: {
        ...seller,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Get KYC request details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateKycStatus(req, res) {
  try {
    const { userId } = req.params;
    const { action, commissionPercentage, reason } = req.body;
    const adminEmail = req.userEmail;

    if (!action || !['approve', 'approve-golive', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid action is required (approve, approve-golive, reject)'
      });
    }

    const seller = await Seller.findByUserId(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.roles || !user.roles.includes(2)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    let updatedSeller;
    let message;

    if (action === 'approve') {
      if (seller.kycApproved) {
        return res.status(400).json({
          success: false,
          message: 'KYC already approved'
        });
      }

      updatedSeller = await Seller.approveKyc(userId, adminEmail);
      message = 'KYC approved successfully. Pending go-live approval.';

    } else if (action === 'approve-golive') {
      if (!commissionPercentage || commissionPercentage < 0 || commissionPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Valid commission percentage (0-100) is required for go-live approval'
        });
      }

      if (!seller.kycApproved) {
        return res.status(400).json({
          success: false,
          message: 'KYC must be approved before go-live approval'
        });
      }

      if (seller.isLive) {
        return res.status(400).json({
          success: false,
          message: 'Seller is already live'
        });
      }

      updatedSeller = await Seller.approveGoLive(userId, adminEmail, commissionPercentage);
      message = 'Seller approved to go live successfully';

    } else if (action === 'reject') {
      updatedSeller = await Seller.rejectKyc(userId, adminEmail, reason);
      message = 'KYC rejected successfully';
    }

    return res.status(200).json({
      success: true,
      message,
      data: updatedSeller.value
    });

  } catch (error) {
    console.error('Update KYC status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateCommission(req, res) {
  try {
    const { userId } = req.params;
    const { commissionPercentage } = req.body;

    if (commissionPercentage === undefined || commissionPercentage < 0 || commissionPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Valid commission percentage (0-100) is required'
      });
    }

    const seller = await Seller.findByUserId(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const updatedSeller = await Seller.update(userId, { commissionPercentage });

    return res.status(200).json({
      success: true,
      message: 'Commission percentage updated successfully',
      data: updatedSeller.value
    });

  } catch (error) {
    console.error('Update commission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getKycRequests,
  getKycRequestDetails,
  updateKycStatus,
  updateCommission
};
