const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Newsletter {
  static collection() {
    return getDB().collection('newsletters');
  }

  static async create(email) {
    const newsletter = {
      email,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(newsletter);
    return { ...newsletter, _id: result.insertedId };
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ email });
  }

  static async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    return await this.collection()
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async count(filter = {}) {
    return await this.collection().countDocuments(filter);
  }

  static async updateStatus(id, status) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Newsletter;
