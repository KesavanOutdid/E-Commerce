const Offer = require('../../../models/Offer');
const User = require('../../../models/User');
const Product = require('../../../models/Product');
const { ObjectId } = require('mongodb');

const parseJsonFields = (data) => {
  const fieldsToParse = ['applicableIds', 'tiers'];
  fieldsToParse.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
      }
    }
  });
  return data;
};

const verifyProductOwnership = async (productIds, userId) => {
  if (!productIds || productIds.length === 0) return true;
  
  // Resolve productIds first (could be _id or productId)
  const resolvedIds = await Product.resolveProductIds(productIds);
  
  if (resolvedIds.length === 0) return false;

  const query = {
    productId: { $in: resolvedIds },
    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
  };
  
  const count = await Product.collection().countDocuments(query);
  return count === resolvedIds.length;
};

exports.createOffer = async (req, res) => {
  try {
    const user = await User.findByUserId(req.userId);
    const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';
    
    const offerData = parseJsonFields({ 
      ...req.body, 
      ownerType: 'admin', 
      ownerId: req.userId,
      ownerName: ownerName
    });

    // Verify product ownership if applicable
    if (offerData.applicableType === 'product' && offerData.applicableIds) {
      const isOwner = await verifyProductOwnership(offerData.applicableIds, req.userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only create offers for your own products' });
      }
    }

    if (req.file) {
      offerData.image = `/uploads/promotions/${req.file.filename}`;
    }
    const offer = await Offer.create(offerData);
    res.status(201).json({ success: true, message: 'Offer created successfully', data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.collection().find().toArray();
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const existingOffer = await Offer.findById(req.params.id);
    if (!existingOffer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Ownership check: Only allow editing if the offer is owned by an admin
    if (existingOffer.owner?.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit admin-created offers' });
    }

    const user = await User.findByUserId(req.userId);
    const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';

    const updateData = parseJsonFields({ 
      ...req.body,
      ownerName: ownerName 
    });

    // Verify product ownership if applicable
    if (updateData.applicableType === 'product' && updateData.applicableIds) {
      const isOwner = await verifyProductOwnership(updateData.applicableIds, req.userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only link your own products to this offer' });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/promotions/${req.file.filename}`;
    }
    const offer = await Offer.update(req.params.id, updateData);
    res.status(200).json({ success: true, message: 'Offer updated successfully', data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const existingOffer = await Offer.findById(req.params.id);
    if (!existingOffer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Ownership check: Only allow deletion if the offer is owned by an admin
    if (existingOffer.owner?.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete admin-created offers' });
    }

    const result = await Offer.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
