const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class RegistrationOtp {
  static collection() {
    return getDB().collection('registration_otps');
  }

  static async create(otpData) {
    const otp = {
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

  static async verify(email, otpCode) {
    return await this.collection().findOne({
      email,
      otpCode,
      expiresAt: { $gt: new Date() }
    });
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

module.exports = RegistrationOtp;
