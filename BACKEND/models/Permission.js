const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Permission {
  static collection() {
    return getDB().collection('permissions');
  }

  static async create(permissionData) {
    const permission = {
      roleId: permissionData.roleId,
      module: permissionData.module,
      submodule: permissionData.submodule || null,
      canCreate: permissionData.canCreate || false,
      canView: permissionData.canView || false,
      canUpdate: permissionData.canUpdate || false,
      canDelete: permissionData.canDelete || false,
      canApprove: permissionData.canApprove || false,
      status: permissionData.status !== undefined ? permissionData.status : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(permission);
    return { ...permission, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByRole(roleId) {
    return await this.collection().find({ roleId, status: true }).toArray();
  }

  static async findByRoleAndModule(roleId, module, submodule = null) {
    return await this.collection().findOne({
      roleId,
      module,
      submodule,
      status: true
    });
  }

  static async checkPermission(roleId, module, submodule, action) {
    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
    const permission = await this.collection().findOne({
      roleId,
      module,
      submodule: submodule || null,
      [`can${capitalizedAction}`]: true,
      status: true
    });
    return !!permission;
  }

  static async upsert(permissionData) {
    const existing = await this.findByRoleAndModule(
      permissionData.roleId,
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
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async bulkUpsert(roleId, permissionsArray) {
    const results = [];
    for (const perm of permissionsArray) {
      const result = await this.upsert({
        roleId,
        ...perm
      });
      results.push(result);
    }
    return results;
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async deleteByRole(roleId) {
    return await this.collection().deleteMany({ roleId });
  }
}

module.exports = Permission;
