const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const cartController = require('../../controllers/cart/cartController');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.createCart);
router.post('/items', authMiddleware, cartController.addItem);
router.delete('/items/:productId', authMiddleware, cartController.removeItem);
router.put('/items/:productId', authMiddleware, cartController.updateItemQty);
router.delete('/clear', authMiddleware, cartController.clearCart);
router.put('/:id', authMiddleware, cartController.updateCart);
router.delete('/:id', authMiddleware, cartController.deleteCart);

module.exports = router;
