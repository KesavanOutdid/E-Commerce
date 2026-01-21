const Offer = require('../../../models/Offer');
const Seller = require('../../../models/Seller');
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

exports.createOffer = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Seller profile not found' });
    }

    const offerData = parseJsonFields({ ...req.body });
    
    // Enforcement: Sellers can only create product-related offers
    offerData.applicableType = 'product';
    offerData.ownerType = 'seller';
    offerData.ownerId = seller._id;

    if (req.file) {
      offerData.image = `/uploads/promotions/${req.file.filename}`;
    }

    const offer = await Offer.create(offerData);
    res.status(201).json({ success: true, message: 'Offer created successfully', data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOffers = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Seller profile not found' });
    }

    const offers = await Offer.collection().find({ 
      'owner.type': 'seller',
      'owner.id': seller._id 
    }).toArray();
    
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Ensure offer belongs to this seller
    if (offer.owner.id.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const existingOffer = await Offer.findById(req.params.id);
    if (!existingOffer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Ensure offer belongs to this seller
    if (existingOffer.owner.id.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updateData = parseJsonFields({ ...req.body });
    
    // Enforcement: Cannot change type to something other than product
    delete updateData.applicableType; 
    delete updateData.ownerType;
    delete updateData.ownerId;

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
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const existingOffer = await Offer.findById(req.params.id);
    if (!existingOffer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Ensure offer belongs to this seller
    if (existingOffer.owner.id.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await Offer.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
