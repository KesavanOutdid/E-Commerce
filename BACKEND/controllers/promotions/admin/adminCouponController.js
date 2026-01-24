const Coupon = require('../../../models/Coupon');
const User = require('../../../models/User');
const Product = require('../../../models/Product');
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

const verifyProductOwnership = async (productIds, userId) => {
  if (!productIds || productIds.length === 0) return true;
  
  const resolvedIds = await Product.resolveProductIds(productIds);
  if (resolvedIds.length === 0) return false;

  const query = {
    productId: { $in: resolvedIds },
    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
  };
  
  const count = await Product.collection().countDocuments(query);
  return count === resolvedIds.length;
};

exports.createCoupon = async (req, res) => {
  try {
    const user = await User.findByUserId(req.userId);
    const ownerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';

    const couponData = parseJsonFields({ 
      ...req.body,
      ownerType: 'admin',
      ownerId: req.userId,
      ownerName: ownerName
    });

    // Verify product ownership if applicable
    if (couponData.applicableType === 'product' && couponData.applicableIds) {
      const isOwner = await verifyProductOwnership(couponData.applicableIds, req.userId);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only create coupons for your own products' });
      }
    }

    if (req.file) {
      couponData.image = `/uploads/promotions/${req.file.filename}`;
    }
    const coupon = await Coupon.create(couponData);
    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.collection().find().toArray();
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const existingCoupon = await Coupon.findById(req.params.id);
    if (!existingCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Ownership check: Only allow editing if the coupon is owned by an admin
    if (existingCoupon.owner?.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only edit admin-created coupons' });
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
        return res.status(403).json({ success: false, message: 'You can only link your own products to this coupon' });
      }
    }

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
    const existingCoupon = await Coupon.findById(req.params.id);
    if (!existingCoupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    // Ownership check: Only allow deletion if the coupon is owned by an admin
    if (existingCoupon.owner?.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You can only delete admin-created coupons' });
    }

    const result = await Coupon.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
