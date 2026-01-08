const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const priceHistoryController = require('../../controllers/priceHistory/priceHistoryController');

router.get('/', authMiddleware, priceHistoryController.getAllPriceHistory);
router.get('/user', authMiddleware, priceHistoryController.getUserPriceHistory);
router.get('/platform-fees', authMiddleware, priceHistoryController.getPlatformFeesHistory);
router.get('/platform-fees/total', authMiddleware, priceHistoryController.getPlatformFeesTotal);
router.get('/seller/:sellerId', authMiddleware, priceHistoryController.getSellerPriceHistory);
router.get('/order/:orderId', authMiddleware, priceHistoryController.getOrderPriceHistory);

module.exports = router;
