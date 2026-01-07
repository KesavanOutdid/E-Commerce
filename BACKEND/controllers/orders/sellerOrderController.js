const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');

const enrichOrderWithSellerDetails = async (order) => {
  if (!order.items || order.items.length === 0) return order;

  const enrichedItems = await Promise.all(
    order.items.map(async (item) => {
      try {
        const product = await Product.findById(item.productId);
        
        if (product && product.userId) {
          const seller = await User.findByUserId(product.userId);
          
          return {
            ...item,
            sellerDetails: seller ? {
              sellerId: seller.userId,
              sellerName: seller.name || seller.email,
              sellerEmail: seller.email
            } : null
          };
        }
        
        return item;
      } catch (error) {
        console.error(`Error fetching seller for product ${item.productId}:`, error);
        return item;
      }
    })
  );

  return {
    ...order,
    items: enrichedItems
  };
};

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to view your orders' 
      });
    }

    const sellerProducts = await Product.find({ userId: sellerId });

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No products found. Add products to receive orders',
        data: [],
        pagination: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      });
    }

    const productIds = sellerProducts.map(product => product.productId);

    const orders = await Order.findByProductIds(productIds, {
      limit: limit,
      skip: skip
    });

    if (orders.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No orders found for your products yet',
        data: [],
        pagination: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      });
    }

    const total = await Order.countByProductIds(productIds);
    const totalPages = Math.ceil(total / limit);

    const filteredOrders = await Promise.all(
      orders.map(async (order) => {
        const filteredOrder = {
          ...order,
          items: order.items.filter(item => productIds.includes(item.productId))
        };
        return await enrichOrderWithSellerDetails(filteredOrder);
      })
    );

    res.status(200).json({ 
      success: true,
      message: 'Orders retrieved successfully', 
      data: filteredOrders,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to load orders. Please try again later'
    });
  }
};

exports.getSellerOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.userId;

    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to view order details' 
      });
    }

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    const sellerProducts = await Product.find({ userId: sellerId });

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No products found for your account' 
      });
    }

    const productIds = sellerProducts.map(product => product.productId);

    const order = await Order.findOrderByIdAndProductIds(orderId, productIds);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or does not contain your products' 
      });
    }

    const filteredOrder = {
      ...order,
      items: order.items.filter(item => productIds.includes(item.productId))
    };

    const enrichedOrder = await enrichOrderWithSellerDetails(filteredOrder);

    res.status(200).json({ 
      success: true,
      message: 'Order details retrieved successfully', 
      data: enrichedOrder 
    });
  } catch (error) {
    console.error('Error in getSellerOrderDetail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to load order details. Please try again later'
    });
  }
};

exports.searchSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to view your orders' 
      });
    }

    const sellerProducts = await Product.find({ userId: sellerId });

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No products found. Add products to receive orders',
        data: [],
        pagination: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      });
    }

    const productIds = sellerProducts.map(product => product.productId);

    const pipeline = [
      {
        $match: {
          'items.productId': { $in: productIds }
        }
      }
    ];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { orderId: searchRegex },
            { 'items.productName': searchRegex },
            { paymentType: searchRegex },
            { paymentStatus: searchRegex }
          ]
        }
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    });

    const result = await Order.collection().aggregate(pipeline).toArray();

    const orders = result[0].data || [];
    const total = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const filteredOrders = await Promise.all(
      orders.map(async (order) => {
        const filteredOrder = {
          ...order,
          items: order.items.filter(item => productIds.includes(item.productId))
        };
        return await enrichOrderWithSellerDetails(filteredOrder);
      })
    );

    res.status(200).json({ 
      success: true,
      message: 'Search results retrieved successfully', 
      data: filteredOrders,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in searchSellerOrders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to search orders. Please try again later'
    });
  }
};
