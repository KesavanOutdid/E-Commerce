const User = require('../../../models/User');
const Seller = require('../../../models/Seller');

async function getPendingKycRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      kycApproved: false,
      onboardingCompleted: true
    };

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
      message: 'Pending KYC requests retrieved successfully',
      data: sellersWithUserInfo,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pending KYC requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getAllKycRequests(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { onboardingCompleted: true };
    
    if (req.query.kycApproved !== undefined) {
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
    console.error('Get all KYC requests error:', error);
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

async function approveKyc(req, res) {
  try {
    const { userId } = req.params;
    const adminEmail = req.userEmail;

    const seller = await Seller.findByUserId(userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.kycApproved) {
      return res.status(400).json({
        success: false,
        message: 'KYC already approved'
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

    const updatedSeller = await Seller.approveKyc(userId, adminEmail);

    return res.status(200).json({
      success: true,
      message: 'KYC approved successfully. Seller is now live.',
      data: updatedSeller.value
    });

  } catch (error) {
    console.error('Approve KYC error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function rejectKyc(req, res) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminEmail = req.userEmail;

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

    const updatedSeller = await Seller.rejectKyc(userId, adminEmail);

    return res.status(200).json({
      success: true,
      message: 'KYC rejected successfully',
      data: {
        ...updatedSeller.value,
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('Reject KYC error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getPendingKycRequests,
  getAllKycRequests,
  getKycRequestDetails,
  approveKyc,
  rejectKyc
};
