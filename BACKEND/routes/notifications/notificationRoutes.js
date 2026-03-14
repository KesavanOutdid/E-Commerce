const express = require('express');
const router = express.Router();
const NotificationService = require('../../services/notificationService');
const authMiddleware = require('../../middleware/authMiddleware');
const { ObjectId } = require('mongodb');

// Apply auth middleware to all notification routes
router.use(authMiddleware);

// Get notifications for current user (recipient type based on route mounting or middleware)
router.get('/', async (req, res) => {
  try {
    const { recipientType } = req.query; // admin, seller, or user
    const recipientId = req.userId; // Assuming userId is available from auth middleware

    // If admin, we don't necessarily need recipientId for general admin notifications
    const targetId = recipientType === 'admin' ? null : recipientId;

    const notifications = await NotificationService.getNotifications(recipientType, targetId, {
      limit: parseInt(req.query.limit) || 20,
      skip: parseInt(req.query.skip) || 0
    });

    const unreadCount = await NotificationService.getUnreadCount(recipientType, targetId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    const { recipientType } = req.body;
    const recipientId = req.userId;
    const targetId = recipientType === 'admin' ? null : recipientId;

    await NotificationService.markAllAsRead(recipientType, targetId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
