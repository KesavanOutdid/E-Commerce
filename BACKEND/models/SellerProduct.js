const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class SellerProduct {
  static collection() {
    return getDB().collection('seller_products');
  }

  static async create(data) {
    const sellerProduct = {
      sellerProductId: crypto.randomUUID(),
      productId: data.productId, // Reference to global Product
      sellerId: ObjectId.isValid(data.sellerId) ? new ObjectId(data.sellerId) : data.sellerId,
      productName: data.productName || null,
      images: data.images || [],
      description: data.description || null,
      shortDescription: data.shortDescription || null,
      attributes: data.attributes || [],
      mainCategoryId: data.mainCategoryId || null,
      subCategoryId: data.subCategoryId || null,
      price: parseFloat(data.price),
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      stock: parseInt(data.stock) || 0,
      deliveryDays: parseInt(data.deliveryDays) || 3,
      sellerStatus: data.sellerStatus || 'active', // active, inactive, out_of_stock
      approvalStatus: data.approvalStatus || 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(sellerProduct);
    return { ...sellerProduct, _id: result.insertedId };
  }

  static async find(query = {}, options = {}) {
    const { skip = 0, limit = 0, sort = { createdAt: -1 } } = options;
    let cursor = this.collection().find(query).sort(sort);
    
    if (skip > 0) cursor = cursor.skip(skip);
    if (limit > 0) cursor = cursor.limit(limit);
    
    return await cursor.toArray();
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { sellerProductId: id }] }
      : { sellerProductId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.sellerId) {
      update.sellerId = ObjectId.isValid(updateData.sellerId) ? new ObjectId(updateData.sellerId) : updateData.sellerId;
    }

    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { sellerProductId: id }] }
      : { sellerProductId: id };

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: update },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { sellerProductId: id }] }
      : { sellerProductId: id };
    return await this.collection().deleteOne(query);
  }

  static async findByProductId(productId) {
    return await this.collection().find({ productId }).toArray();
  }

  static async reduceStock(sellerProductId, quantity) {
    const query = ObjectId.isValid(sellerProductId) 
      ? { $or: [{ _id: new ObjectId(sellerProductId) }, { sellerProductId: sellerProductId }] }
      : { sellerProductId: sellerProductId };

    const listing = await this.collection().findOne(query);
    
    if (!listing) {
      throw new Error(`Listing not found: ${sellerProductId}`);
    }

    const currentStock = parseInt(listing.stock) || 0;
    const qtyToReduce = parseInt(quantity) || 0;

    if (currentStock < qtyToReduce) {
      throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${qtyToReduce}`);
    }

    const newStock = currentStock - qtyToReduce;

    const result = await this.collection().findOneAndUpdate(
      query,
      { 
        $set: { 
          stock: newStock,
          sellerStatus: newStock === 0 ? 'out_of_stock' : listing.sellerStatus,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}

module.exports = SellerProduct;
