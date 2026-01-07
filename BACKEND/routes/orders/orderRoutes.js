const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const orderController = require('../../controllers/orders/orderController');
const adminOrderController = require('../../controllers/orders/adminOrderController');
const sellerOrderController = require('../../controllers/orders/sellerOrderController');

router.post('/create', authMiddleware, orderController.createOrder);
router.post('/verify', authMiddleware, orderController.verifyOrder);
router.get('/history', authMiddleware, orderController.getUserOrders);
router.get('/detail/:orderId', authMiddleware, orderController.getOrderDetail);

router.get('/admin', authMiddleware, adminOrderController.getAllOrders);
router.get('/admin/:orderId', authMiddleware, adminOrderController.getOrderDetail);
router.get('/admin/revenue/total', authMiddleware, adminOrderController.getTotalRevenue);
router.put('/admin/:id/status', authMiddleware, adminOrderController.updateOrderStatus);
router.put('/admin/:id/payment-status', authMiddleware, adminOrderController.updatePaymentStatus);
router.delete('/admin/:id', authMiddleware, adminOrderController.deleteOrder);

router.get('/seller/search', authMiddleware, sellerOrderController.searchSellerOrders);
router.get('/seller', authMiddleware, sellerOrderController.getSellerOrders);
router.get('/seller/:orderId', authMiddleware, sellerOrderController.getSellerOrderDetail);

module.exports = router;
