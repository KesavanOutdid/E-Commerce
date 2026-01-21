const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class Offer {
  static collection() {
    return getDB().collection('offers');
  }

  static async create(data) {
    const offer = {
      offerId: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      type: data.type, // 'direct', 'quantity_tiered', 'bundle'
      owner: {
        type: data.ownerType, // 'admin', 'seller'
        id: data.ownerId ? (ObjectId.isValid(data.ownerId) ? new ObjectId(data.ownerId) : data.ownerId) : null
      },
      applicableTo: {
        type: data.applicableType, // 'product', 'category', 'all'
        ids: data.applicableIds || [] // Array of Product or Category IDs
      },
      tiers: data.tiers || [], // [{ minQty: 2, discountType: 'percentage', value: 10 }]
      discountType: data.discountType, // 'percentage', 'fixed' (for direct offers)
      discountValue: parseFloat(data.discountValue) || 0,
      image: data.image || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status === 'true' || data.status === true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(offer);
    return { ...offer, _id: result.insertedId };
  }

  static async findActive() {
    const now = new Date();
    return await this.collection().find({
      status: { $in: [true, 'true'] },
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).toArray();
  }

  static async findById(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { offerId: id }] }
      : { offerId: id };
    return await this.collection().findOne(query);
  }

  static async update(id, data) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { offerId: id }] }
      : { offerId: id };

    const updateData = { ...data, updatedAt: new Date() };
    delete updateData._id;

    // Handle nested mappings if flat fields are provided
    if (data.applicableType || data.applicableIds) {
      updateData.applicableTo = {
        type: data.applicableType || 'all',
        ids: data.applicableIds || []
      };
      delete updateData.applicableType;
      delete updateData.applicableIds;
    }

    if (data.ownerType || data.ownerId) {
      updateData.owner = {
        type: data.ownerType,
        id: data.ownerId ? (ObjectId.isValid(data.ownerId) ? new ObjectId(data.ownerId) : data.ownerId) : null
      };
      delete updateData.ownerType;
      delete updateData.ownerId;
    }

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = (data.status === 'true' || data.status === true);
    if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);

    const result = await this.collection().findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async delete(id) {
    const query = ObjectId.isValid(id) 
      ? { $or: [{ _id: new ObjectId(id) }, { offerId: id }] }
      : { offerId: id };
    return await this.collection().deleteOne(query);
  }
}

module.exports = Offer;
