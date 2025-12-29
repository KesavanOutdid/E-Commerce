const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Payment {
  static collection() {
    return getDB().collection('payments');
  }

  static async create(paymentData) {
    const payment = {
      orderId: new ObjectId(paymentData.orderId),
      userId: new ObjectId(paymentData.userId),
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status || 'pending',
      transactionId: paymentData.transactionId || null,
      paymentGateway: paymentData.paymentGateway || null,
      paymentDetails: paymentData.paymentDetails || {},
      paymentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(paymentData.createdBy),
      updatedBy: new ObjectId(paymentData.updatedBy)
    };
    const result = await this.collection().insertOne(payment);
    return { ...payment, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByOrderId(orderId) {
    return await this.collection().findOne({ orderId: new ObjectId(orderId) });
  }

  static async findByUserId(userId, options = {}) {
    const query = { userId: new ObjectId(userId) };
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

    if (updateData.updatedBy) {
      update.updatedBy = new ObjectId(updateData.updatedBy);
    }

    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updateStatus(id, status, transactionId = null, updatedBy) {
    const update = {
      status,
      updatedAt: new Date(),
      updatedBy: new ObjectId(updatedBy)
    };

    if (transactionId) {
      update.transactionId = transactionId;
    }

    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
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
      .find({ status })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async getTotalPaymentsByUser(userId) {
    const result = await this.collection().aggregate([
      { $match: { userId: new ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  static async getTotalRevenue() {
    const result = await this.collection().aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }
}

module.exports = Payment;
