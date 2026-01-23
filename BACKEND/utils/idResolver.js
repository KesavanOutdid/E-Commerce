const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Resolves all linked IDs for a product's owner (userId, sellerId, and MongoDB ObjectIDs from both collections)
 * Can take a single ID or an object with userId/sellerId
 */
async function resolveProductSellerIds(input) {
  const ids = new Set();
  
  if (typeof input === 'string') {
    ids.add(input);
  } else if (input instanceof ObjectId) {
    ids.add(input.toString());
  } else if (input && typeof input === 'object') {
    if (input.sellerId) ids.add(input.sellerId.toString());
    if (input.userId) ids.add(input.userId.toString());
    if (input._id) ids.add(input._id.toString());
  }

  const searchIds = Array.from(ids);
  if (searchIds.length === 0) return [];

  const db = getDB();

  // 1. Resolve from User collection
  const user = await db.collection('users').findOne({
    $or: [
      { userId: { $in: searchIds } },
      { _id: { $in: searchIds.map(id => {
        try { return new ObjectId(id); } catch(e) { return null; }
      }).filter(id => id !== null) } }
    ]
  });

  if (user) {
    if (user._id) ids.add(user._id.toString());
    if (user.userId) ids.add(user.userId.toString());
  }

  // 2. Resolve from Seller collection
  const seller = await db.collection('sellers').findOne({
    $or: [
      { userId: { $in: searchIds } },
      { _id: { $in: searchIds.map(id => {
        try { return new ObjectId(id); } catch(e) { return null; }
      }).filter(id => id !== null) } }
    ]
  });

  if (seller) {
    if (seller._id) ids.add(seller._id.toString());
    if (seller.userId) ids.add(seller.userId.toString());
  }

  return Array.from(ids);
}

module.exports = { resolveProductSellerIds };
