const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Role {
  static collection() {
    return getDB().collection('roles');
  }

  static async create(roleData) {
    const maxRole = await this.collection()
      .find()
      .sort({ roleId: -1 })
      .limit(1)
      .toArray();

    const role = {
      roleId: maxRole.length > 0 ? maxRole[0].roleId + 1 : 1,
      roleName: roleData.roleName,
      createdBy: roleData.createdBy,
      createdAt: new Date(),
      modifiedBy: null,
      modifiedAt: null,
      status: true
    };

    const result = await this.collection().insertOne(role);
    return { ...role, _id: result.insertedId };
  }

  static async findById(roleId) {
    return await this.collection().findOne({ roleId });
  }

  static async findByName(roleName) {
    return await this.collection().findOne({ roleName });
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

  static async update(roleId, updateData) {
    return await this.collection().findOneAndUpdate(
      { roleId },
      { 
        $set: {
          ...updateData,
          modifiedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async softDelete(roleId, deletedBy) {
    return await this.collection().findOneAndUpdate(
      { roleId },
      { 
        $set: { 
          status: false,
          modifiedBy: deletedBy,
          modifiedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = Role;
