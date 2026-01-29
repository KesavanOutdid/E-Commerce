const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Service to handle creation and retrieval of notifications
 */
class NotificationService {
  /**
   * Create a new notification
   * @param {Object} data Notification data
   */
  static async createNotification(data) {
    try {
      const notification = await Notification.create(data);
      
      // In a real-time implementation, we would emit a socket event here
      // if (global.io) {
      //   const room = data.recipient === 'admin' ? 'admin-room' : `${data.recipient}-${data.recipientId}`;
      //   global.io.to(room).emit('new-notification', notification);
      // }
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a recipient
   */
  static async getNotifications(recipient, recipientId = null, options = {}) {
    try {
      return await Notification.findByRecipient(recipient, recipientId, options);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(recipient, recipientId = null) {
    try {
      return await Notification.getUnreadCount(recipient, recipientId);
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId) {
    try {
      return await Notification.markAsRead(notificationId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(recipient, recipientId = null) {
    try {
      return await Notification.markAllAsRead(recipient, recipientId);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Helper to notify admin about KYC request
   */
  static async notifyAdminKYCRequest(sellerId, shopName) {
    return this.createNotification({
      recipient: 'admin',
      type: 'KYC_REQUEST',
      title: 'New KYC Request',
      message: `Seller "${shopName}" has submitted a KYC request for approval.`,
      data: { sellerId, shopName }
    });
  }

  /**
   * Helper to notify admin about new product for approval
   */
  static async notifyAdminProductApproval(productId, productName, sellerId) {
    return this.createNotification({
      recipient: 'admin',
      type: 'PRODUCT_APPROVAL',
      title: 'Product Approval Required',
      message: `A new product "${productName}" requires approval.`,
      data: { productId, productName, sellerId }
    });
  }

  /**
   * Helper for low stock notification
   */
  static async notifyLowStock(recipient, recipientId, productId, productName, variantId, currentStock) {
    return this.createNotification({
      recipient: recipient, // could be 'admin' or 'seller'
      recipientId: recipientId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `Product "${productName}" (Variant: ${variantId}) is low on stock: ${currentStock} remaining.`,
      data: { productId, variantId, currentStock }
    });
  }
}

module.exports = NotificationService;
