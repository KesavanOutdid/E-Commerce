const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Seller {
  static collection() {
    return getDB().collection('sellers');
  }

  static async create(sellerData) {
    const seller = {
      userId: sellerData.userId,
      shopName: sellerData.shopName,
      gstin: sellerData.gstin || null,
      panNumber: sellerData.panNumber || null,
      kycApproved: sellerData.kycApproved || false,
      onboardingCompleted: sellerData.onboardingCompleted || false,
      isLive: sellerData.isLive || false,
      commissionPercentage: sellerData.commissionPercentage || 10,
      bankDetails: sellerData.bankDetails || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedBy: sellerData.approvedBy || null,
      approvedAt: sellerData.approvedAt || null
    };

    const result = await this.collection().insertOne(seller);
    return { ...seller, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId) {
    return await this.collection().findOne({ userId });
  }

  static async findByGstin(gstin) {
    return await this.collection().findOne({ gstin });
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

  static async approveKyc(userId, approvedBy) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          kycApproved: true,
          isLive: true,
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async rejectKyc(userId, approvedBy) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          kycApproved: false,
          isLive: false,
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateBankDetails(userId, bankDetails) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          bankDetails,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
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
}

module.exports = Seller;
