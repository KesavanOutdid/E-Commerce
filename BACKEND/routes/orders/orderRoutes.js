const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const orderController = require('../../controllers/orders/orderController');

router.post('/create', authMiddleware, orderController.createOrder);
router.post('/verify', authMiddleware, orderController.verifyOrder);
router.get('/history', authMiddleware, orderController.getUserOrders);
router.get('/detail/:orderId', authMiddleware, orderController.getOrderDetail);

router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/revenue', authMiddleware, orderController.getTotalRevenue);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/payment-status', authMiddleware, orderController.updatePaymentStatus);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
