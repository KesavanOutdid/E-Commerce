const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class User {
  static collection() {
    return getDB().collection('users');
  }

  static async create(userData) {
    const user = {
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone || null,
      password: userData.password,
      roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles || 3],
      profileImage: userData.profileImage || null,
      addresses: userData.addresses || [],
      pickupAddresses: userData.pickupAddresses || [],
      wishlist: userData.wishlist || [],
      sellerEarnings: userData.sellerEarnings || 0,
      platformFees: userData.platformFees || 0,
      status: userData.status !== undefined ? userData.status : true,
      authenticator: userData.authenticator || false,
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userData.createdBy || null,
      updatedBy: userData.updatedBy || null
    };
    const result = await this.collection().insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId) {
    return await this.collection().findOne({ userId });
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ email });
  }

  static async findByPhone(phone) {
    return await this.collection().findOne({ phone });
  }

  static async findByIdentifier(identifier) {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    const mobileRegex = /^(?:\+91)?[6-9]\d{9}$/;

    if (emailRegex.test(identifier)) {
      return await this.findByEmail(identifier);
    } else if (mobileRegex.test(identifier)) {
      const cleanPhone = identifier.replace(/^\+91/, '');
      return await this.findByPhone(cleanPhone);
    }
    return null;
  }

  static async update(userId, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };
    
    return await this.collection().findOneAndUpdate(
      { userId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async updatePassword(userId, newPassword, modifiedBy) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          password: newPassword,
          updatedAt: new Date(),
          updatedBy: modifiedBy
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateLastLogin(userId) {
    return await this.collection().updateOne(
      { userId },
      { $set: { lastLoginAt: new Date() } }
    );
  }

  static async addAddress(userId, address) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $push: { addresses: address },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateAddress(userId, addressIndex, addressData) {
    const update = {};
    Object.keys(addressData).forEach(key => {
      update[`addresses.${addressIndex}.${key}`] = addressData[key];
    });
    update.updatedAt = new Date();

    return await this.collection().findOneAndUpdate(
      { userId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async removeAddress(userId, addressIndex) {
    const user = await this.findByUserId(userId);
    if (!user) return null;

    user.addresses.splice(addressIndex, 1);
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          addresses: user.addresses,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  // Pickup Address Helpers
  static async addPickupAddress(userId, address) {
    const addressWithId = {
      ...address,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $push: { pickupAddresses: addressWithId },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async updatePickupAddress(userId, addressId, addressData) {
    const user = await this.findByUserId(userId);
    if (!user || !user.pickupAddresses) return null;

    const index = user.pickupAddresses.findIndex(addr => addr.id === addressId);
    if (index === -1) return null;

    const update = {};
    Object.keys(addressData).forEach(key => {
      update[`pickupAddresses.${index}.${key}`] = addressData[key];
    });
    update[`pickupAddresses.${index}.updatedAt`] = new Date();
    update.updatedAt = new Date();

    return await this.collection().findOneAndUpdate(
      { userId },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async removePickupAddress(userId, addressId) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $pull: { pickupAddresses: { id: addressId } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async addToWishlist(userId, productId) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $addToSet: { wishlist: productId },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async removeFromWishlist(userId, productId) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $pull: { wishlist: productId },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async getWishlist(userId) {
    const user = await this.collection().findOne(
      { userId },
      { projection: { wishlist: 1 } }
    );
    return user ? user.wishlist || [] : [];
  }

  static async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10 } = options;
    return await this.collection()
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async count(filter = {}) {
    return await this.collection().countDocuments(filter);
  }

  static async delete(userId) {
    return await this.collection().deleteOne({ userId });
  }

  static async addSellerEarnings(userId, amount) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $inc: { sellerEarnings: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async addPlatformFees(userId, amount) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $inc: { platformFees: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = User;
