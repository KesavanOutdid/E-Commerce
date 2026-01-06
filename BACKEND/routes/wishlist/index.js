const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist/wishlistController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/', authMiddleware, wishlistController.getWishlist);
router.post('/add', authMiddleware, wishlistController.addToWishlist);
router.delete('/remove/:productId', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;
