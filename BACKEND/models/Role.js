const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Role {
  static collection() {
    return getDB().collection('roles');
  }

  static async create(roleData) {
    const maxRole = await this.collection()
      .find()
      .sort({ role_id: -1 })
      .limit(1)
      .toArray();

    const role = {
      role_id: maxRole.length > 0 ? maxRole[0].role_id + 1 : 1,
      role_name: roleData.role_name,
      created_by: roleData.created_by,
      created_time: new Date(),
      modified_by: null,
      modified_at: null,
      status: true
    };

    const result = await this.collection().insertOne(role);
    return { ...role, _id: result.insertedId };
  }

  static async findById(role_id) {
    return await this.collection().findOne({ role_id });
  }

  static async findByName(role_name) {
    return await this.collection().findOne({ role_name });
  }

  static async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10 } = options;
    return await this.collection()
      .find({ ...filter, status: true })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async count(filter = {}) {
    return await this.collection().countDocuments({ ...filter, status: true });
  }

  static async update(role_id, updateData) {
    return await this.collection().findOneAndUpdate(
      { role_id },
      { 
        $set: {
          ...updateData,
          modified_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async softDelete(role_id, deletedBy) {
    return await this.collection().findOneAndUpdate(
      { role_id },
      { 
        $set: { 
          status: false,
          modified_by: deletedBy,
          modified_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = Role;
