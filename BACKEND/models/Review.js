const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Review {
  static collection() {
    return getDB().collection('reviews');
  }

  static async create(reviewData) {
    const review = {
      productId: reviewData.productId,
      variantId: reviewData.variantId,
      sellerId: ObjectId.isValid(reviewData.sellerId) ? new ObjectId(reviewData.sellerId) : reviewData.sellerId,
      userId: ObjectId.isValid(reviewData.userId) ? new ObjectId(reviewData.userId) : reviewData.userId,
      orderId: reviewData.orderId,
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      photos: Array.isArray(reviewData.photos) ? reviewData.photos : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(review);
    return { ...review, _id: result.insertedId };
  }

  static async findOne(query) {
    const formattedQuery = { ...query };
    if (formattedQuery.sellerId) {
      formattedQuery.sellerId = ObjectId.isValid(formattedQuery.sellerId) ? new ObjectId(formattedQuery.sellerId) : formattedQuery.sellerId;
    }
    if (formattedQuery.userId) {
      formattedQuery.userId = ObjectId.isValid(formattedQuery.userId) ? new ObjectId(formattedQuery.userId) : formattedQuery.userId;
    }
    return await this.collection().findOne(formattedQuery);
  }

  static async findByProductId(productId, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ productId: productId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findByVariantId(variantId, options = {}) {
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find({ variantId: variantId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async getAverageRating(productId) {
    const result = await this.collection().aggregate([
      { $match: { productId: productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } }
    ]).toArray();
    return result[0] || { avgRating: 0, totalReviews: 0 };
  }

  static async getVariantAverageRating(variantId) {
    const result = await this.collection().aggregate([
      { $match: { variantId: variantId } },
      { $group: { _id: '$variantId', avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } }
    ]).toArray();
    return result[0] || { avgRating: 0, totalReviews: 0 };
  }

  static async getSellerAverageRating(sellerId) {
    const result = await this.collection().aggregate([
      { $match: { sellerId: ObjectId.isValid(sellerId) ? new ObjectId(sellerId) : sellerId } },
      { $group: { _id: '$sellerId', avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } }
    ]).toArray();
    return result[0] || { avgRating: 0, totalReviews: 0 };
  }
}

module.exports = Review;
