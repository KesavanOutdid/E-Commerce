const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const cartController = require('../../controllers/cart/cartController');

router.get('/', authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addItem);
router.put('/update/:productId', authMiddleware, cartController.updateItemQty);
router.delete('/remove/:productId', authMiddleware, cartController.removeItem);
router.delete('/clear', authMiddleware, cartController.clearCart);

module.exports = router;
