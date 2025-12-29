const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class Product {
  static collection() {
    return getDB().collection('products');
  }

  static async create(productData) {
    const product = {
      productId: crypto.randomUUID(), // Automatically generate UUID
      productName: productData.productName,
      slug: productData.slug,
      description: productData.description,
      categoryId: productData.categoryId, // Storing Category UUID
      subCategoryId: productData.subCategoryId || null, // Storing Subcategory UUID
      masterProductId: productData.masterProductId || null, // Grouping identical products
      userId: new ObjectId(productData.userId),
      price: productData.price,
      salePrice: productData.salePrice,
      stock: productData.stock || 0,
      images: productData.images || [],
      //  DYNAMIC ATTRIBUTES
      attributes: (productData.attributes || []).map(attr => ({
        attributeId: ObjectId.isValid(attr.attributeId) ? new ObjectId(attr.attributeId) : attr.attributeId,
        name: attr.name,
        value: attr.value
      })),
      avgRating: productData.avgRating || 0,
      totalReviews: productData.totalReviews || 0,
      approvalStatus: productData.approvalStatus || 'pending',
      rejectionReason: productData.rejectionReason || null,
      status: productData.status !== undefined ? productData.status : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(product);
    return { ...product, _id: result.insertedId };
  }

  static async find(query = {}, options = {}) {
    // Recursive function to convert userId strings to ObjectIds in the query
    const convertUserIds = (obj) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.userId && typeof obj.userId === 'string' && ObjectId.isValid(obj.userId)) {
        obj.userId = new ObjectId(obj.userId);
      }

      // Handle arrays like $or, $and
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => convertUserIds(item));
        } else if (typeof obj[key] === 'object') {
          convertUserIds(obj[key]);
        }
      });
    };

    convertUserIds(query);

    const { skip = 0, limit = 0, sort = { createdAt: -1 } } = options;
    let cursor = this.collection().find(query).sort(sort);
    
    if (skip > 0) cursor = cursor.skip(skip);
    if (limit > 0) cursor = cursor.limit(limit);
    
    return await cursor.toArray();
  }

  static async count(query = {}) {
    // Convert ObjectIds in query for count as well
    const convertUserIds = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.userId && typeof obj.userId === 'string' && ObjectId.isValid(obj.userId)) {
        obj.userId = new ObjectId(obj.userId);
      }
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => convertUserIds(item));
        } else if (typeof obj[key] === 'object') {
          convertUserIds(obj[key]);
        }
      });
    };
    convertUserIds(query);
    return await this.collection().countDocuments(query);
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { productId: id }] }
      : { productId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.userId && ObjectId.isValid(updateData.userId)) {
      update.userId = new ObjectId(updateData.userId);
    }
    
    if (updateData.attributes) {
      update.attributes = updateData.attributes.map(attr => ({
        attributeId: ObjectId.isValid(attr.attributeId) ? new ObjectId(attr.attributeId) : attr.attributeId,
        name: attr.name,
        value: attr.value
      }));
    }

    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { productId: id }] }
      : { productId: id };

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: update },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Product;
