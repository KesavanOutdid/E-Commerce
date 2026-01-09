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
      kycApprovedBy: sellerData.kycApprovedBy || null,
      kycApprovedAt: sellerData.kycApprovedAt || null,
      onboardingCompleted: sellerData.onboardingCompleted || false,
      commissionPercentage: sellerData.commissionPercentage || 10,
      bankDetails: sellerData.bankDetails || null,
      shopAddress: sellerData.shopAddress || null,
      shopLogo: sellerData.shopLogo || null,
      createdAt: new Date(),
      updatedAt: new Date()
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
          kycApprovedBy: approvedBy,
          kycApprovedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async rejectKyc(userId, rejectedBy, reason) {
    return await this.collection().findOneAndUpdate(
      { userId },
      { 
        $set: { 
          kycApproved: false,
          kycRejectedBy: rejectedBy,
          kycRejectedAt: new Date(),
          kycRejectionReason: reason,
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
