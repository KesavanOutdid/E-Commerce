const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class PriceHistory {
  static collection() {
    return getDB().collection('price_history');
  }

  static async create(data) {
    const record = {
      userId: data.userId,
      type: data.type,
      orderId: data.orderId,
      productId: data.productId,
      sellerProductId: data.sellerProductId || null,
      sellerId: data.sellerId || null,
      amount: parseFloat(data.amount),
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      platformFee: data.platformFee ? parseFloat(data.platformFee) : null,
      paymentType: data.paymentType,
      createdAt: new Date()
    };
    const result = await this.collection().insertOne(record);
    return { ...record, _id: result.insertedId };
  }

  static async findByUserId(userId, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findByType(type, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ type })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findBySellerId(sellerId, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ sellerId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findByOrderId(orderId) {
    return await this.collection().find({ orderId }).toArray();
  }

  static async getTotalByUserId(userId) {
    const result = await this.collection().aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  static async getTotalPlatformFees() {
    const result = await this.collection().aggregate([
      { $match: { type: 'platform_fee' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  static async getTotalSellerEarnings(sellerId) {
    const result = await this.collection().aggregate([
      { $match: { type: 'seller_earning', sellerId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
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

  static async count(filter = {}) {
    return await this.collection().countDocuments(filter);
  }
}

module.exports = PriceHistory;
