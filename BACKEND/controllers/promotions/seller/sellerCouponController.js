const Coupon = require('../../../models/Coupon');
const Seller = require('../../../models/Seller');
const { ObjectId } = require('mongodb');

const parseJsonFields = (data) => {
  const fieldsToParse = ['applicableIds'];
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

exports.createCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Seller profile not found' });
    }

    const couponData = parseJsonFields({ ...req.body });
    
    // Enforcement: Sellers can only create product-related coupons
    couponData.applicableType = 'product';
    couponData.sellerId = seller._id;

    if (req.file) {
      couponData.image = `/uploads/promotions/${req.file.filename}`;
    }

    const coupon = await Coupon.create(couponData);
    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyCoupons = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    if (!seller) {
      return res.status(403).json({ success: false, message: 'Seller profile not found' });
    }

    const coupons = await Coupon.collection().find({ 
      sellerId: seller._id 
    }).toArray();
    
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Ensure coupon belongs to this seller
    if (coupon.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const existingCoupon = await Coupon.findById(req.params.id);
    if (!existingCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Ensure coupon belongs to this seller
    if (existingCoupon.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updateData = parseJsonFields({ ...req.body });
    
    // Enforcement: Cannot change type to something other than product
    delete updateData.applicableType; 
    delete updateData.sellerId;

    if (req.file) {
      updateData.image = `/uploads/promotions/${req.file.filename}`;
    }

    const coupon = await Coupon.update(req.params.id, updateData);
    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const seller = await Seller.findByUserId(userId);
    
    const existingCoupon = await Coupon.findById(req.params.id);
    if (!existingCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Ensure coupon belongs to this seller
    if (existingCoupon.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await Coupon.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
