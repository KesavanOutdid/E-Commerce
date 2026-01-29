const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Notification {
  static collection() {
    return getDB().collection('notifications');
  }

  static async create(notificationData) {
    const notification = {
      recipient: notificationData.recipient, // 'admin', 'seller', 'user'
      recipientId: notificationData.recipientId || null, // Specific ID if needed
      type: notificationData.type, // 'KYC_REQUEST', 'PRODUCT_APPROVAL', 'LOW_STOCK', etc.
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {}, // Related object IDs or info
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(notification);
    return { ...notification, _id: result.insertedId };
  }

  static async findByRecipient(recipient, recipientId = null, options = {}) {
    const { skip = 0, limit = 20 } = options;
    const query = { recipient };
    if (recipientId) {
      query.recipientId = recipientId;
    }
    return await this.collection()
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async markAsRead(notificationId) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
  }

  static async markAllAsRead(recipient, recipientId = null) {
    const query = { recipient, isRead: false };
    if (recipientId) {
      query.recipientId = recipientId;
    }
    return await this.collection().updateMany(
      query,
      { $set: { isRead: true, updatedAt: new Date() } }
    );
  }

  static async getUnreadCount(recipient, recipientId = null) {
    const query = { recipient, isRead: false };
    if (recipientId) {
      query.recipientId = recipientId;
    }
    return await this.collection().countDocuments(query);
  }

  static async delete(notificationId) {
    return await this.collection().deleteOne({ _id: new ObjectId(notificationId) });
  }
}

module.exports = Notification;
