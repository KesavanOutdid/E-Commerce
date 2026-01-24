const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const Product = require('./Product');

class Offer {
  static collection() {
    return getDB().collection('offers');
  }

  static async create(data) {
    let applicableIds = data.applicableIds || [];
    if (data.applicableType === 'product' && applicableIds.length > 0) {
      applicableIds = await Product.resolveProductIds(applicableIds);
    }

    let discountValue = parseFloat(data.discountValue) || 0;
    let discountType = data.discountType;
    if (data.type === 'quantity_tiered' && data.tiers && data.tiers.length > 0) {
      const sortedTiers = [...data.tiers].sort((a, b) => parseInt(a.minQty) - parseInt(b.minQty));
      discountValue = parseFloat(sortedTiers[0].value);
      discountType = sortedTiers[0].discountType;
    }

    const offer = {
      offerId: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      type: data.type, // 'direct', 'quantity_tiered', 'bundle'
      owner: {
        type: data.ownerType, // 'admin', 'seller'
        id: data.ownerId ? (ObjectId.isValid(data.ownerId) ? new ObjectId(data.ownerId) : data.ownerId) : null,
        name: data.ownerName || null
      },
      applicableTo: {
        type: data.applicableType, // 'product', 'category', 'all'
        ids: applicableIds // Array of Product or Category IDs
      },
      tiers: data.tiers || [], // [{ minQty: 2, discountType: 'percentage', value: 10 }]
      discountType: discountType, // 'percentage', 'fixed' (for direct offers)
      discountValue: discountValue,
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

    const existingOffer = await this.findById(id);
    if (!existingOffer) return null;

    const updateData = { ...data, updatedAt: new Date() };
    delete updateData._id;

    // Handle nested mappings if flat fields are provided
    if (data.applicableType || data.applicableIds) {
      const type = data.applicableType || (existingOffer ? existingOffer.applicableTo.type : 'all');
      let ids = data.applicableIds || (existingOffer ? existingOffer.applicableTo.ids : []);
      
      if (type === 'product' && ids.length > 0) {
        ids = await Product.resolveProductIds(ids);
      }

      updateData.applicableTo = {
        type: type,
        ids: ids
      };
      delete updateData.applicableType;
      delete updateData.applicableIds;
    }

    if (data.ownerType || data.ownerId || data.ownerName) {
      updateData.owner = {
        type: data.ownerType || (existingOffer ? existingOffer.owner.type : 'admin'),
        id: data.ownerId ? (ObjectId.isValid(data.ownerId) ? new ObjectId(data.ownerId) : data.ownerId) : (existingOffer ? existingOffer.owner.id : null),
        name: data.ownerName || (existingOffer ? existingOffer.owner.name : null)
      };
      delete updateData.ownerType;
      delete updateData.ownerId;
      delete updateData.ownerName;
    }

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = (data.status === 'true' || data.status === true);

    const finalType = data.type || existingOffer.type;
    const finalTiers = data.tiers || existingOffer.tiers;

    if (finalType === 'quantity_tiered' && finalTiers && finalTiers.length > 0) {
      const sortedTiers = [...finalTiers].sort((a, b) => parseInt(a.minQty) - parseInt(b.minQty));
      updateData.discountValue = parseFloat(sortedTiers[0].value);
      updateData.discountType = sortedTiers[0].discountType;
    } else {
      if (data.discountValue !== undefined) updateData.discountValue = parseFloat(data.discountValue);
      if (data.discountType !== undefined) updateData.discountType = data.discountType;
    }

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
