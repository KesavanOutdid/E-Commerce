const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class ProductVariant {
  static collection() {
    return getDB().collection('product_variants');
  }

  static async create(data) {
    const variant = {
      variantId: crypto.randomUUID(),
      productId: data.productId, // Link to Master Product
      sellerId: ObjectId.isValid(data.sellerId) ? new ObjectId(data.sellerId) : data.sellerId,
      attributes: data.attributes || [], // e.g., [{name: "Color", value: "Red"}]
      price: parseFloat(data.price) || 0,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      stock: parseInt(data.stock) || 0,
      images: data.images || [],
      deliveryDays: parseInt(data.deliveryDays) || 3,
      pickupAddress: data.pickupAddress || null,
      approvalStatus: data.approvalStatus || 'pending',
      status: data.status !== undefined ? data.status : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(variant);
    return { ...variant, _id: result.insertedId };
  }

  static async findByProductId(productId) {
    return await this.collection().find({ productId }).toArray();
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { variantId: id }] }
      : { variantId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, updateData) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { variantId: id }] }
      : { variantId: id };

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { variantId: id }] }
      : { variantId: id };
    return await this.collection().deleteOne(query);
  }

  static async reduceStock(variantId, quantity) {
    const query = ObjectId.isValid(variantId) 
      ? { $or: [{ _id: new ObjectId(variantId) }, { variantId: variantId }] }
      : { variantId: variantId };

    const variant = await this.collection().findOne(query);
    
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }

    const currentStock = parseInt(variant.stock) || 0;
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
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}

module.exports = ProductVariant;
