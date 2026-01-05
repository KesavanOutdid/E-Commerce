const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');

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

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, paymentType, paymentStatus } = req.query;
    
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentType) filter.paymentType = paymentType.toLowerCase();
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    const orders = await Order.findAll({
      limit: limit,
      skip: skip,
      filter
    });

    const enrichedOrders = await Promise.all(
      orders.map(order => enrichOrderWithSellerDetails(order))
    );

    const total = await Order.countAll(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      success: true,
      message: 'Orders retrieved successfully', 
      data: enrichedOrders,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to retrieve orders. Please try again later'
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    const order = await Order.findByOrderId(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const enrichedOrder = await enrichOrderWithSellerDetails(order);

    res.status(200).json({ 
      success: true,
      message: 'Order details retrieved successfully', 
      data: enrichedOrder 
    });
  } catch (error) {
    console.error('Error in getOrderDetail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to load order details. Please try again later'
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.userId
    };

    const order = await Order.update(id, updateData);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Order updated successfully', 
      data: order 
    });
  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to update order. Please try again'
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order status is required' 
      });
    }

    const order = await Order.updateOrderStatus(id, status, req.userId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Order status updated successfully', 
      data: order 
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to update order status. Please try again'
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment status is required' 
      });
    }

    const order = await Order.updatePaymentStatus(id, paymentStatus, req.userId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Payment status updated successfully', 
      data: order 
    });
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to update payment status. Please try again'
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    const result = await Order.delete(id);
    
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to delete order. Please try again'
    });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const totalRevenue = await Order.getTotalRevenue();

    res.status(200).json({ 
      success: true,
      message: 'Total revenue calculated successfully', 
      data: {
        totalRevenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Error in getTotalRevenue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to calculate revenue. Please try again'
    });
  }
};
