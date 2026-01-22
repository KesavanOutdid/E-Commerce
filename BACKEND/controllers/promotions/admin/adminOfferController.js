const Offer = require('../../../models/Offer');
const User = require('../../../models/User');

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
    const user = await User.findByUserId(req.userId);
    const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';
    
    const offerData = parseJsonFields({ 
      ...req.body, 
      ownerType: 'admin', 
      ownerId: req.userId,
      ownerName: ownerName
    });
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
    const user = await User.findByUserId(req.userId);
    const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';

    const updateData = parseJsonFields({ 
      ...req.body,
      ownerName: ownerName 
    });
    if (req.file) {
      updateData.image = `/uploads/promotions/${req.file.filename}`;
    }
    const offer = await Offer.update(req.params.id, updateData);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, message: 'Offer updated successfully', data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const result = await Offer.delete(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
