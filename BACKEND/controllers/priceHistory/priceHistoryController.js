const PriceHistory = require('../../models/PriceHistory');

exports.getAllPriceHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, userId, sellerId, paymentType } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (sellerId) filter.sellerId = sellerId;
    if (paymentType) filter.paymentType = paymentType;
    
    const history = await PriceHistory.findAll({
      limit,
      skip,
      filter
    });

    const total = await PriceHistory.count(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      success: true,
      message: 'Price history retrieved successfully', 
      data: history,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllPriceHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve price history'
    });
  }
};

exports.getUserPriceHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await PriceHistory.findByUserId(userId, {
      limit,
      skip
    });

    const total = await PriceHistory.count({ userId });
    const totalPages = Math.ceil(total / limit);
    const totalEarnings = await PriceHistory.getTotalByUserId(userId);

    res.status(200).json({ 
      success: true,
      message: 'Your price history retrieved successfully', 
      data: history,
      summary: {
        totalEarnings
      },
      pagination: {
        total,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getUserPriceHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve your price history'
    });
  }
};

exports.getSellerPriceHistory = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await PriceHistory.findBySellerId(sellerId, {
      limit,
      skip
    });

    const total = await PriceHistory.count({ sellerId });
    const totalPages = Math.ceil(total / limit);
    const totalEarnings = await PriceHistory.getTotalSellerEarnings(sellerId);

    res.status(200).json({ 
      success: true,
      message: 'Seller price history retrieved successfully', 
      data: history,
      summary: {
        totalEarnings
      },
      pagination: {
        total,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getSellerPriceHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve seller price history'
    });
  }
};

exports.getOrderPriceHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const history = await PriceHistory.findByOrderId(orderId);

    if (!history || history.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No price history found for this order'
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Order price history retrieved successfully', 
      data: history
    });
  } catch (error) {
    console.error('Error in getOrderPriceHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve order price history'
    });
  }
};

exports.getPlatformFeesTotal = async (req, res) => {
  try {
    const totalPlatformFees = await PriceHistory.getTotalPlatformFees();

    res.status(200).json({ 
      success: true,
      message: 'Total platform fees retrieved successfully', 
      data: {
        totalPlatformFees
      }
    });
  } catch (error) {
    console.error('Error in getPlatformFeesTotal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve total platform fees'
    });
  }
};

exports.getPlatformFeesHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await PriceHistory.findByType('platform_fee', {
      limit,
      skip
    });

    const total = await PriceHistory.count({ type: 'platform_fee' });
    const totalPages = Math.ceil(total / limit);
    const totalPlatformFees = await PriceHistory.getTotalPlatformFees();

    res.status(200).json({ 
      success: true,
      message: 'Platform fees history retrieved successfully', 
      data: history,
      summary: {
        totalPlatformFees
      },
      pagination: {
        total,
        page,
        limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getPlatformFeesHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve platform fees history'
    });
  }
};
