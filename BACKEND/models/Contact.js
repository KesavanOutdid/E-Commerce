const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Contact {
  static collection() {
    return getDB().collection('contacts');
  }

  static async create(contactData) {
    const contact = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      subject: contactData.subject,
      phone: contactData.phone,
      message: contactData.message,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(contact);
    return { ...contact, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
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

module.exports = Contact;
