const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Permission {
  static collection() {
    return getDB().collection('permissions');
  }

  static async create(permissionData) {
    const permission = {
      role_id: permissionData.role_id,
      module: permissionData.module,
      submodule: permissionData.submodule || null,
      can_create: permissionData.can_create || false,
      can_view: permissionData.can_view || false,
      can_update: permissionData.can_update || false,
      can_delete: permissionData.can_delete || false,
      status: permissionData.status !== undefined ? permissionData.status : true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await this.collection().insertOne(permission);
    return { ...permission, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByRole(role_id) {
    return await this.collection().find({ role_id, status: true }).toArray();
  }

  static async findByRoleAndModule(role_id, module, submodule = null) {
    return await this.collection().findOne({
      role_id,
      module,
      submodule,
      status: true
    });
  }

  static async checkPermission(role_id, module, submodule, action) {
    const permission = await this.collection().findOne({
      role_id,
      module,
      submodule: submodule || null,
      [`can_${action}`]: true,
      status: true
    });
    return !!permission;
  }

  static async upsert(permissionData) {
    const existing = await this.findByRoleAndModule(
      permissionData.role_id,
      permissionData.module,
      permissionData.submodule
    );

    if (existing) {
      return await this.update(existing._id.toString(), permissionData);
    } else {
      return await this.create(permissionData);
    }
  }

  static async update(id, updateData) {
    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async bulkUpsert(role_id, permissionsArray) {
    const results = [];
    for (const perm of permissionsArray) {
      const result = await this.upsert({
        role_id,
        ...perm
      });
      results.push(result);
    }
    return results;
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async deleteByRole(role_id) {
    return await this.collection().deleteMany({ role_id });
  }
}

module.exports = Permission;
