const Offer = require('../../../models/Offer');
const Coupon = require('../../../models/Coupon');
const Product = require('../../../models/Product');
const { calculateCartPrices } = require('../../../utils/priceCalculator');

exports.getActiveOffers = async (req, res) => {
  try {
    const offers = await Offer.findActive();
    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active offers',
      error: error.message
    });
  }
};

exports.getOffersByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const activeOffers = await Offer.findActive();
    
    // Filter offers that apply to this specific product, variant, or its category or 'all'
    const productOffers = activeOffers.filter(offer => {
      // 1. Seller Ownership Check
      const offerSellerId = offer.sellerId?.toString() || offer.owner?.id?.toString();
      const productSellerId = (product.sellerId || product.userId)?.toString();
      
      if (offer.owner?.type === 'seller' && offerSellerId && productSellerId) {
        if (offerSellerId !== productSellerId) return false;
      }

      // 2. Applicability Type Check
      if (offer.applicableTo.type === 'all') return true;
      
      const applicableIds = (offer.applicableTo.ids || []).map(id => id.toString());
      const prodId = product._id?.toString() || product.productId;
      const subCatId = product.subCategoryId ? product.subCategoryId.toString() : null;
      const mainCatId = product.mainCategoryId ? product.mainCategoryId.toString() : null;

      if (offer.applicableTo.type === 'product') {
        return applicableIds.includes(productId) || 
               (prodId && applicableIds.includes(prodId)) ||
               (variantId && applicableIds.includes(variantId.toString()));
      }
      if (offer.applicableTo.type === 'category') {
        return (subCatId && applicableIds.includes(subCatId)) || 
               (mainCatId && applicableIds.includes(mainCatId));
      }
      return false;
    });

    res.json({
      success: true,
      data: productOffers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product offers',
      error: error.message
    });
  }
};

exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findActive();
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active coupons',
      error: error.message
    });
  }
};

exports.verifyCoupon = async (req, res) => {
  try {
    const { code, cartItems } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findByCode(code);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    const now = new Date();
    if (coupon.expiryDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // If cart items are provided, calculate actual discount
    if (cartItems && cartItems.length > 0) {
      const result = await calculateCartPrices(cartItems, code);
      
      if (!result.appliedCoupon) {
        // If coupon was not applied, it probably didn't meet minOrderValue
        return res.status(400).json({
          success: false,
          message: `Coupon requirements not met. Minimum order value: ${coupon.minOrderValue}`,
          minOrderValue: coupon.minOrderValue
        });
      }

      return res.json({
        success: true,
        message: 'Coupon verified',
        data: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          couponDiscount: result.couponDiscount,
          grandTotal: result.grandTotal,
          subTotal: result.subTotal
        }
      });
    }

    // Just verify existence and general validity if no cart items provided
    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying coupon',
      error: error.message
    });
  }
};

exports.getCouponsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const activeCoupons = await Coupon.findActive();
    
    // Filter coupons that apply to this specific product, variant, or its category or 'all'
    const productCoupons = activeCoupons.filter(coupon => {
      // 1. Seller Ownership Check
      const couponSellerId = coupon.sellerId?.toString() || coupon.owner?.id?.toString();
      const productSellerId = (product.sellerId || product.userId)?.toString();
      
      if (coupon.owner?.type === 'seller' && couponSellerId && productSellerId) {
        if (couponSellerId !== productSellerId) return false;
      }

      // 2. Applicability Type Check
      if (coupon.applicableTo.type === 'all') return true;

      const applicableIds = (coupon.applicableTo.ids || []).map(id => id.toString());
      const prodId = product._id?.toString() || product.productId;
      const subCatId = product.subCategoryId ? product.subCategoryId.toString() : null;
      const mainCatId = product.mainCategoryId ? product.mainCategoryId.toString() : null;

      if (coupon.applicableTo.type === 'product') {
        return applicableIds.includes(productId) || 
               (prodId && applicableIds.includes(prodId)) ||
               (variantId && applicableIds.includes(variantId.toString()));
      }
      if (coupon.applicableTo.type === 'category') {
        return (subCatId && applicableIds.includes(subCatId)) || 
               (mainCatId && applicableIds.includes(mainCatId));
      }
      return false;
    });

    res.json({
      success: true,
      data: productCoupons
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product coupons',
      error: error.message
    });
  }
};
