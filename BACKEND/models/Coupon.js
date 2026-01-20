const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class Coupon {
  static collection() {
    return getDB().collection('coupons');
  }

  static async create(data) {
    const coupon = {
      couponId: crypto.randomUUID(),
      code: data.code.toUpperCase(),
      description: data.description,
      discountType: data.discountType, // 'percentage', 'fixed'
      discountValue: data.discountValue,
      minOrderValue: data.minOrderValue || 0,
      maxDiscountAmount: data.maxDiscountAmount || null,
      expiryDate: new Date(data.expiryDate),
      usageLimit: data.usageLimit || null, // Total times usable
      userLimit: data.userLimit || 1, // Times per user
      usedCount: 0,
      applicableTo: {
        type: data.applicableType || 'all', // 'product', 'category', 'all'
        ids: data.applicableIds || []
      },
      sellerId: data.sellerId ? (ObjectId.isValid(data.sellerId) ? new ObjectId(data.sellerId) : data.sellerId) : null,
      status: data.status !== undefined ? data.status : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(coupon);
    return { ...coupon, _id: result.insertedId };
  }

  static async findByCode(code) {
    return await this.collection().findOne({ code: code.toUpperCase(), status: true });
  }

  static async incrementUsage(couponId) {
    return await this.collection().updateOne(
      { couponId },
      { $inc: { usedCount: 1 } }
    );
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { couponId: id }] }
      : { couponId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, data) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { couponId: id }] }
      : { couponId: id };

    const updateData = { ...data, updatedAt: new Date() };

    // Handle nested mappings if flat fields are provided
    if (data.applicableType || data.applicableIds) {
      updateData.applicableTo = {
        type: data.applicableType || 'all',
        ids: data.applicableIds || []
      };
      delete updateData.applicableType;
      delete updateData.applicableIds;
    }

    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);
    if (data.sellerId) updateData.sellerId = ObjectId.isValid(data.sellerId) ? new ObjectId(data.sellerId) : data.sellerId;

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { couponId: id }] }
      : { couponId: id };
    return await this.collection().deleteOne(query);
  }
}

module.exports = Coupon;
