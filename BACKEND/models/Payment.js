const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Payment {
  static collection() {
    return getDB().collection('payments');
  }

  static async create(paymentData) {
    const payment = {
      orderId: paymentData.orderId,
      userId: paymentData.userId,
      userEmail: paymentData.userEmail,
      razorpayOrderId: paymentData.razorpayOrderId || null,
      razorpayPaymentId: paymentData.razorpayPaymentId || null,
      razorpaySignature: paymentData.razorpaySignature || null,
      totalPrice: paymentData.totalPrice,
      gst: paymentData.gst,
      subTotal: paymentData.subTotal,
      grandTotal: paymentData.grandTotal,
      codFee: paymentData.codFee || 0,
      paymentType: paymentData.paymentType,
      paymentStatus: paymentData.paymentStatus || 'Pending',
      paymentDate: paymentData.paymentDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: paymentData.createdBy,
      updatedBy: paymentData.updatedBy
    };
    const result = await this.collection().insertOne(payment);
    return { ...payment, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByOrderId(orderId) {
    return await this.collection().findOne({ orderId: orderId });
  }

  static async findByRazorpayOrderId(razorpayOrderId) {
    return await this.collection().findOne({ razorpayOrderId: razorpayOrderId });
  }

  static async findByUserId(userId, options = {}) {
    const query = { userId: userId };
    const { limit = 10, skip = 0, sort = { paymentDate: -1 } } = options;
    return await this.collection()
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findAll(options = {}) {
    const { limit = 10, skip = 0, sort = { paymentDate: -1 }, filter = {} } = options;
    return await this.collection()
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updateByRazorpayOrderId(razorpayOrderId, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    return await this.collection().findOneAndUpdate(
      { razorpayOrderId: razorpayOrderId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updateStatus(orderId, status, updatedBy) {
    const update = {
      paymentStatus: status,
      updatedAt: new Date(),
      updatedBy: updatedBy
    };

    return await this.collection().findOneAndUpdate(
      { orderId: orderId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async getPaymentsByStatus(status, options = {}) {
    const { limit = 10, skip = 0, sort = { paymentDate: -1 } } = options;
    return await this.collection()
      .find({ paymentStatus: status })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async getTotalPaymentsByUser(userId) {
    const result = await this.collection().aggregate([
      { $match: { userId: userId, paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  static async getTotalRevenue() {
    const result = await this.collection().aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  static async countByUserId(userId) {
    return await this.collection().countDocuments({ userId: userId });
  }
}

module.exports = Payment;
