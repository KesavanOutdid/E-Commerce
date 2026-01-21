const Coupon = require('../../../models/Coupon');

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
    const couponData = parseJsonFields({ ...req.body });
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
    const updateData = parseJsonFields({ ...req.body });
    if (req.file) {
      updateData.image = `/uploads/promotions/${req.file.filename}`;
    }
    const coupon = await Coupon.update(req.params.id, updateData);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const result = await Coupon.delete(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
