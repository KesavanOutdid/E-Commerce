const Order = require('../../models/Order');
const Cart = require('../../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, billingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items are required' 
      });
    }

    if (!totalAmount || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Total amount, shipping address, and payment method are required' 
      });
    }

    const orderData = {
      userId: req.userId,
      items,
      totalAmount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdBy: req.userId,
      updatedBy: req.userId
    };

    const order = await Order.create(orderData);

    await Cart.clearCart(req.userId);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const orders = await Order.findByUserId(req.userId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    const total = await Order.countByUserId(req.userId);

    res.status(200).json({ 
      success: true, 
      data: orders,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { limit = 10, skip = 0, status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.findAll({
      limit: parseInt(limit),
      skip: parseInt(skip),
      filter
    });

    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const order = await Order.updateStatus(id, status, req.userId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.delete(id);
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const revenue = await Order.getTotalRevenue();
    res.status(200).json({ success: true, data: { revenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
