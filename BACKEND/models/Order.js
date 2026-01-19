const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Order {
  static collection() {
    return getDB().collection('orders');
  }

  static generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  static async create(orderData) {
    const order = {
      orderId: this.generateOrderId(),
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      gst: orderData.gst,
      subTotal: orderData.subTotal,
      grandTotal: orderData.grandTotal,
      codFees: orderData.codFees || 0,
      shippingFees: orderData.shippingFees || 0,
      deliveryAddress: orderData.deliveryAddress,
      paymentType: orderData.paymentType,
      paymentStatus: orderData.paymentStatus || 'pending',
      orderStatus: orderData.orderStatus || 'pending',
      razorpayOrderId: orderData.razorpayOrderId || null,
      razorpayPaymentId: orderData.razorpayPaymentId || null,
      razorpaySignature: orderData.razorpaySignature || null,
      trackingId: orderData.trackingId || null,
      carrier: orderData.carrier || null,
      estimatedDeliveryDate: orderData.estimatedDeliveryDate || null,
      deliveryStatus: orderData.deliveryStatus || 'pending',
      statusHistory: orderData.statusHistory || [
        {
          status: orderData.orderStatus || 'pending',
          timestamp: new Date(),
          updatedBy: orderData.createdBy || 'system'
        }
      ],
      time: orderData.time || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: orderData.createdBy,
      updatedBy: orderData.updatedBy
    };
    const result = await this.collection().insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId, options = {}) {
    const query = { userId: userId };
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findByOrderId(orderId) {
    return await this.collection().findOne({ orderId: orderId });
  }

  static async findByUserIdAndOrderId(userId, orderId) {
    return await this.collection().findOne({ userId: userId, orderId: orderId });
  }

  static async findByRazorpayOrderId(razorpayOrderId) {
    return await this.collection().findOne({ razorpayOrderId: razorpayOrderId });
  }

  static async findAll(options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 }, filter = {} } = options;
    return await this.collection()
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async update(orderId, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    return await this.collection().findOneAndUpdate(
      { orderId: orderId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updatePaymentDetails(razorpayOrderId, paymentData) {
    return await this.collection().findOneAndUpdate(
      { razorpayOrderId: razorpayOrderId },
      { 
        $set: { 
          paymentStatus: paymentData.paymentStatus || 'completed',
          orderStatus: paymentData.orderStatus || 'confirmed',
          razorpayPaymentId: paymentData.razorpayPaymentId,
          razorpaySignature: paymentData.razorpaySignature,
          updatedAt: new Date(),
          updatedBy: paymentData.updatedBy
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateOrderStatus(orderId, status, updatedBy, extraData = {}) {
    const update = { 
      orderStatus: status,
      updatedAt: new Date(),
      updatedBy: updatedBy,
      ...extraData
    };
    
    const historyEntry = {
      status: status,
      timestamp: new Date(),
      updatedBy: updatedBy
    };

    return await this.collection().findOneAndUpdate(
      { orderId: orderId },
      { 
        $set: update,
        $push: { statusHistory: historyEntry }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateStatusHistory(orderId, historyEntries) {
    return await this.collection().findOneAndUpdate(
      { orderId: orderId },
      { 
        $push: { statusHistory: { $each: historyEntries } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async updatePaymentStatus(orderId, paymentStatus, updatedBy) {
    return await this.collection().findOneAndUpdate(
      { orderId: orderId },
      { 
        $set: { 
          paymentStatus: paymentStatus,
          updatedAt: new Date(),
          updatedBy: updatedBy
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async countByUserId(userId) {
    return await this.collection().countDocuments({ userId: userId });
  }

  static async countAll(filter = {}) {
    return await this.collection().countDocuments(filter);
  }

  static async findByProductIds(productIds, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ 'items.productId': { $in: productIds } })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async countByProductIds(productIds) {
    return await this.collection().countDocuments({ 'items.productId': { $in: productIds } });
  }

  static async findOrderByIdAndProductIds(orderId, productIds) {
    return await this.collection().findOne({ 
      orderId: orderId,
      'items.productId': { $in: productIds }
    });
  }

  static async getTotalRevenue() {
    const result = await this.collection().aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }
}

module.exports = Order;
