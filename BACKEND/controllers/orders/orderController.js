const Order = require('../../models/Order');
const Payment = require('../../models/Payment');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_oHoZ3Q1fF6pYEI',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_secret_key'
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { deliveryAddress, paymentType, totalPrice, gst, subTotal, grandTotal } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to place an order' 
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a delivery address' 
      });
    }

    if (!paymentType || !['COD', 'ONLINE'].includes(paymentType.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select a valid payment method (COD or ONLINE)' 
      });
    }

    if (totalPrice === undefined || gst === undefined || subTotal === undefined || grandTotal === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price information is missing. Please try again' 
      });
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const cart = await Cart.findByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your cart is empty. Please add items before checkout' 
      });
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.productName} is no longer available` 
        });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stock} items available for ${item.productName}` 
        });
      }
    }

    const codFee = paymentType.toUpperCase() === 'COD' ? 100 : 0;
    const finalGrandTotal = grandTotal + codFee;

    let razorpayOrder = null;
    if (paymentType.toUpperCase() === 'ONLINE') {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalGrandTotal * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });
    }

    const orderData = {
      userId: userId,
      userEmail: user.email,
      items: cart.items,
      totalPrice: totalPrice,
      gst: gst,
      subTotal: subTotal,
      grandTotal: finalGrandTotal,
      codFee: codFee,
      deliveryAddress: deliveryAddress,
      paymentType: paymentType.toUpperCase(),
      paymentStatus: 'Pending',
      orderStatus: paymentType.toUpperCase() === 'COD' ? 'Confirmed' : 'Pending',
      razorpayOrderId: razorpayOrder?.id || null,
      createdBy: user.email,
      updatedBy: user.email
    };

    const order = await Order.create(orderData);

    const paymentData = {
      orderId: order.orderId,
      userId: userId,
      userEmail: user.email,
      razorpayOrderId: razorpayOrder?.id || null,
      totalPrice: totalPrice,
      gst: gst,
      subTotal: subTotal,
      grandTotal: finalGrandTotal,
      codFee: codFee,
      paymentType: paymentType.toUpperCase(),
      paymentStatus: 'Pending',
      createdBy: user.email,
      updatedBy: user.email
    };

    await Payment.create(paymentData);

    if (paymentType.toUpperCase() === 'COD') {
      await Cart.clearCart(userId);
    }

    const generatedSignature = razorpayOrder
      ? crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_secret_key')
          .update(`${razorpayOrder.id}|${order.orderId}`)
          .digest('hex')
      : null;

    return res.status(201).json({ 
      success: true,
      message: paymentType.toUpperCase() === 'COD' 
        ? 'Order placed successfully!' 
        : 'Order created. Please complete the payment',
      data: {
        orderId: order.orderId,
        userId: userId,
        razorpayOrder: razorpayOrder,
        razorpaySignature: generatedSignature,
        paymentType: paymentType.toUpperCase(),
        items: cart.items,
        deliveryAddress: deliveryAddress,
        priceBreakdown: {
          totalPrice: totalPrice,
          gst: gst,
          subTotal: subTotal,
          codFee: codFee,
          grandTotal: finalGrandTotal
        },
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create order. Please try again',
      error: error.message 
    });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification details are missing' 
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_secret_key')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed. Please contact support' 
      });
    }

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const order = await Order.findByRazorpayOrderId(razorpay_order_id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    await Payment.updateByRazorpayOrderId(razorpay_order_id, {
      paymentStatus: 'Completed',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      updatedBy: user.email
    });

    await Order.updatePaymentDetails(razorpay_order_id, {
      paymentStatus: 'Completed',
      orderStatus: 'Confirmed',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      updatedBy: user.email
    });

    await Cart.clearCart(userId);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Your order is confirmed!'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed. Please try again',
      error: error.message 
    });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (!userId) {
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

    const order = await Order.findByUserIdAndOrderId(userId, orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Order details retrieved successfully', 
      data: order 
    });
  } catch (error) {
    console.error('Error in getOrderDetail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve order details. Please try again',
      error: error.message 
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to view your orders' 
      });
    }

    const orders = await Order.findByUserId(userId, {
      limit: limit,
      skip: skip
    });
    const total = await Order.countByUserId(userId);
    const totalPages = Math.ceil(total / limit);

    if (orders.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'You have no orders yet. Start shopping!',
        data: [],
        pagination: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Your order history loaded successfully', 
      data: orders,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve order history. Please try again',
      error: error.message 
    });
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
