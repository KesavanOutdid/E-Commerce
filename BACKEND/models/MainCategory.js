const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class MainCategory {
  static collection() {
    return getDB().collection('main_categories');
  }

  static async create(data) {
    const category = {
      categoryId: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      level: 1,
      status: data.status !== undefined ? data.status : true,
      createdBy: data.createdBy || null,
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
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { categoryId: id }] }
      : { categoryId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };
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
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { categoryId: id };
    return await this.collection().deleteOne(query);
  }
}

module.exports = MainCategory;
