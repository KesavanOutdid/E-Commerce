const Review = require('../../models/Review');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.userId; // Set by authMiddleware
    const photo = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5' });
    }

    // Validate comment length (100 characters max as per user requirement)
    if (comment && comment.length > 100) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 100 characters' });
    }

    // 1. Verify the order exists and belongs to the user
    const order = await Order.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is the owner of the order
    if (order.userId !== userId) {
      // In some systems userId might be ObjectId, in others String. Check consistency.
      if (order.userId.toString() !== userId.toString()) {
         return res.status(403).json({ success: false, message: 'Unauthorized to review this order' });
      }
    }

    // 2. Verify the order is delivered
    if (order.orderStatus.toLowerCase() !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review delivered products' });
    }

    // 3. Verify the product is in the order
    const productInOrder = order.items.find(item => item.productId === productId);
    if (!productInOrder) {
      return res.status(400).json({ success: false, message: 'Product not found in this order' });
    }

    // 4. Check if review already exists for this order and product
    const existingReview = await Review.findOne({ orderId, productId, userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product for this order' });
    }

    // 5. Create review
    const review = await Review.create({
      productId,
      userId,
      orderId,
      rating: ratingNum,
      comment,
      photo
    });

    // 6. Update Product average rating and total reviews
    const stats = await Review.getAverageRating(productId);
    await Product.update(productId, {
      avgRating: stats.avgRating,
      totalReviews: stats.totalReviews
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.findByProductId(productId, { limit, skip });
    
    // Get stats
    const stats = await Review.getAverageRating(productId);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: stats
    });
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
