const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const orderController = require('../../controllers/orders/orderController');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getAllOrders);
router.get('/user', authMiddleware, orderController.getUserOrders);
router.get('/revenue', authMiddleware, orderController.getTotalRevenue);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/payment-status', authMiddleware, orderController.updatePaymentStatus);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
