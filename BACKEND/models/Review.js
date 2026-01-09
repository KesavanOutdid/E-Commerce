const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Review {
  static collection() {
    return getDB().collection('reviews');
  }

  static async create(reviewData) {
    const review = {
      productId: reviewData.productId,
      userId: ObjectId.isValid(reviewData.userId) ? new ObjectId(reviewData.userId) : reviewData.userId,
      orderId: reviewData.orderId,
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      photo: reviewData.photo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(review);
    return { ...review, _id: result.insertedId };
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

  static async findByUserId(userId) {
    const query = ObjectId.isValid(userId) ? { userId: new ObjectId(userId) } : { userId: userId };
    return await this.collection().find(query).toArray();
  }

  static async findOne(query) {
    if (query.userId && ObjectId.isValid(query.userId)) {
      query.userId = new ObjectId(query.userId);
    }
    return await this.collection().findOne(query);
  }

  static async getAverageRating(productId) {
    const result = await this.collection().aggregate([
      { $match: { productId: productId } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, totalReviews: { $count: {} } } }
    ]).toArray();
    return result[0] || { avgRating: 0, totalReviews: 0 };
  }
}

module.exports = Review;
