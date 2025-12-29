const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Order {
  static collection() {
    return getDB().collection('orders');
  }

  static async create(orderData) {
    const order = {
      userId: new ObjectId(orderData.userId),
      items: orderData.items.map(item => ({
        productId: new ObjectId(item.productId),
        qty: item.qty,
        price: item.price
      })),
      totalAmount: orderData.totalAmount,
      status: orderData.status || 'pending',
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus || 'unpaid',
      orderDate: new Date(),
      deliveryDate: orderData.deliveryDate || null,
      trackingNumber: orderData.trackingNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(orderData.createdBy),
      updatedBy: new ObjectId(orderData.updatedBy)
    };
    const result = await this.collection().insertOne(order);
    return { ...order, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId, options = {}) {
    const query = { userId: new ObjectId(userId) };
    const { limit = 10, skip = 0, sort = { orderDate: -1 } } = options;
    return await this.collection()
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findAll(options = {}) {
    const { limit = 10, skip = 0, sort = { orderDate: -1 }, filter = {} } = options;
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

    if (updateData.items) {
      update.items = updateData.items.map(item => ({
        productId: new ObjectId(item.productId),
        qty: item.qty,
        price: item.price
      }));
    }

    if (updateData.updatedBy) {
      update.updatedBy = new ObjectId(updateData.updatedBy);
    }

    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updateStatus(id, status, updatedBy) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          updatedBy: new ObjectId(updatedBy)
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async updatePaymentStatus(id, paymentStatus, updatedBy) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          paymentStatus,
          updatedAt: new Date(),
          updatedBy: new ObjectId(updatedBy)
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async countByUserId(userId) {
    return await this.collection().countDocuments({ userId: new ObjectId(userId) });
  }

  static async getTotalRevenue() {
    const result = await this.collection().aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }
}

module.exports = Order;
