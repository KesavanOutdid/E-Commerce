const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class Category {
  static collection() {
    return getDB().collection('categories');
  }

  static async create(categoryData) {
    const category = {
      categoryId: crypto.randomUUID(), // Automatically generate UUID
      name: categoryData.name,
      slug: categoryData.slug,
      parentId: categoryData.parentId || null, // Stores UUID of parent
      level: categoryData.level, // 1 = Category, 2 = Subcategory, 3 = Child
      status: categoryData.status !== undefined ? categoryData.status : true,
      createdBy: categoryData.createdBy ? new ObjectId(categoryData.createdBy) : null,
      updatedBy: categoryData.updatedBy ? new ObjectId(categoryData.updatedBy) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  static async find(query = {}, options = {}) {
    const { skip = 0, limit = 0, sort = { createdAt: -1 } } = options;
    let cursor = this.collection().find(query).sort(sort);
    
    if (skip > 0) cursor = cursor.skip(skip);
    if (limit > 0) cursor = cursor.limit(limit);
    
    return await cursor.toArray();
  }

  static async count(query = {}) {
    return await this.collection().countDocuments(query);
  }

  static async findById(id) {
    // Try finding by _id (ObjectId) or categoryId (UUID)
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { categoryId: id }] }
      : { categoryId: id };
    return await this.collection().findOne(query);
  }

  static async findByUuid(uuid) {
    return await this.collection().findOne({ categoryId: uuid });
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };

    if (updateData.updatedBy) {
      update.updatedBy = new ObjectId(updateData.updatedBy);
    }

    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { categoryId: id }] }
      : { categoryId: id };

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

module.exports = Category;
