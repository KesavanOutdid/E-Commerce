const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class Product {
  static collection() {
    return getDB().collection('products');
  }

  static async create(productData) {
    const product = {
      productId: crypto.randomUUID(),
      productName: productData.productName,
      slug: productData.slug,
      description: productData.description,
      shortDescription: productData.shortDescription,
      brand: productData.brand || null,
      highlights: productData.highlights || [],
      specifications: productData.specifications || [],
      warranty: productData.warranty || null,
      mainCategoryId: productData.mainCategoryId,
      subCategoryId: productData.subCategoryId,
      userId: ObjectId.isValid(productData.userId) ? new ObjectId(productData.userId) : productData.userId,
      roleId: productData.roleId || null,
      status: productData.status !== undefined ? productData.status : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(product);
    return { ...product, _id: result.insertedId };
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { productId: id }] }
      : { productId: id };
    return await this.collection().findOne(query);
  }

  static async find(query = {}) {
    return await this.collection().find(query).toArray();
  }

  static async update(id, updateData) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { productId: id }] }
      : { productId: id };

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { productId: id }] }
      : { productId: id };
    return await this.collection().deleteOne(query);
  }
}

module.exports = Product;
