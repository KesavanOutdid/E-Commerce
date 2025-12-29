const Payment = require('../../models/Payment');
const Order = require('../../models/Order');

exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, paymentGateway, paymentDetails } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID, amount, and payment method are required' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const paymentData = {
      orderId,
      userId: req.userId,
      amount,
      paymentMethod,
      paymentGateway: paymentGateway || 'manual',
      paymentDetails: paymentDetails || {},
      status: 'pending',
      createdBy: req.userId,
      updatedBy: req.userId
    };

    const payment = await Payment.create(paymentData);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findByOrderId(orderId);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found for this order' 
      });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const payments = await Payment.findByUserId(req.userId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.status(200).json({ 
      success: true, 
      data: payments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { limit = 10, skip = 0, status } = req.query;
    const filter = status ? { status } : {};
    
    const payments = await Payment.findAll({
      limit: parseInt(limit),
      skip: parseInt(skip),
      filter
    });

    res.status(200).json({ 
      success: true, 
      data: payments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.userId
    };

    const payment = await Payment.update(id, updateData);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const payment = await Payment.updateStatus(id, status, transactionId, req.userId);

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    if (status === 'completed' && payment.orderId) {
      await Order.updatePaymentStatus(payment.orderId.toString(), 'paid', req.userId);
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await Payment.delete(id);
    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTotalRevenue = async (req, res) => {
  try {
    const revenue = await Payment.getTotalRevenue();
    res.status(200).json({ success: true, data: { revenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserTotalPayments = async (req, res) => {
  try {
    const total = await Payment.getTotalPaymentsByUser(req.userId);
    res.status(200).json({ success: true, data: { total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
