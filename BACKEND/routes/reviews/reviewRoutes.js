const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const reviewUpload = require('../../middleware/reviewUploadMiddleware');
const reviewController = require('../../controllers/reviews/reviewController');

// Create a review (requires authentication and optional photo upload)
router.post('/', authMiddleware, reviewUpload.single('photo'), reviewController.createReview);

// Get reviews for a specific product
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
