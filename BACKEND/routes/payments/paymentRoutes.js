const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const paymentController = require('../../controllers/payments/paymentController');

router.post('/', authMiddleware, paymentController.createPayment);
router.get('/', authMiddleware, paymentController.getAllPayments);
router.get('/user', authMiddleware, paymentController.getUserPayments);
router.get('/user/total', authMiddleware, paymentController.getUserTotalPayments);
router.get('/revenue', authMiddleware, paymentController.getTotalRevenue);
router.get('/order/:orderId', authMiddleware, paymentController.getPaymentByOrderId);
router.get('/:id', authMiddleware, paymentController.getPaymentById);
router.put('/:id', authMiddleware, paymentController.updatePayment);
router.put('/:id/status', authMiddleware, paymentController.updatePaymentStatus);
router.delete('/:id', authMiddleware, paymentController.deletePayment);

module.exports = router;
