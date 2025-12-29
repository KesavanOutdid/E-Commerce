const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class PasswordResetOtp {
  static collection() {
    return getDB().collection('passwordResetOtps');
  }

  static async create(otpData) {
    const otp = {
      userId: otpData.userId,
      email: otpData.email,
      otpCode: otpData.otpCode,
      expiresAt: new Date(Date.now() + 180000),
      createdAt: new Date()
    };

    const result = await this.collection().insertOne(otp);
    return { ...otp, _id: result.insertedId };
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });
  }

  static async findByOtpRef(otpRef) {
    return await this.collection().findOne({ 
      _id: new ObjectId(otpRef),
      expiresAt: { $gt: new Date() }
    });
  }

  static async verify(otpRef, otpCode) {
    return await this.collection().findOne({
      _id: new ObjectId(otpRef),
      otpCode,
      expiresAt: { $gt: new Date() }
    });
  }

  static async deleteByUserId(userId) {
    return await this.collection().deleteMany({ userId });
  }

  static async deleteByEmail(email) {
    return await this.collection().deleteMany({ email });
  }

  static async deleteExpired() {
    return await this.collection().deleteMany({
      expiresAt: { $lte: new Date() }
    });
  }
}

module.exports = PasswordResetOtp;
