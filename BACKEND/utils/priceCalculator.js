const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Order = require('../models/Order');
const { resolveProductSellerIds } = require('./idResolver');

/**
 * Counts how many times a user has used a specific coupon
 */
async function countCouponUsageByUser(userId, couponCode) {
  if (!userId || !couponCode) return 0;
  return await Order.collection().countDocuments({
    userId: userId,
    couponCode: couponCode,
    paymentStatus: { $ne: 'failed' } // Only count successful or pending orders
  });
}

/**
 * Calculates the layered price for a set of cart items.
 * Layers: 1. Base Discount (Sale Price) 
 *         2. Tiered/Quantity Offers
 *         3. Platform Incentives
 *         4. Coupons (Applied at the end)
 */
async function calculateCartPrices(items, couponCode = null, userId = null) {
  const activeOffers = await Offer.findActive();
  let totalOrderValue = 0;

  const processedItems = await Promise.all(items.map(async (item) => {
    let price = parseFloat(item.price) || 0; // Original Price
    let salePrice = parseFloat(item.salePrice || item.price) || 0; // Seller's current sale price
    let finalItemPrice = salePrice;
    let appliedOffer = null;
    let resolvedSellerIds = [];

    // Resolve all possible seller IDs for the product/variant
    if (item.variantId) {
      const variant = await ProductVariant.findById(item.variantId);
      if (variant) resolvedSellerIds = await resolveProductSellerIds(variant);
    } else if (item.productId) {
      const product = await Product.findById(item.productId);
      if (product) resolvedSellerIds = await resolveProductSellerIds(product);
    }

    // 1. Check for Active Offers (Direct or Tiered)
    const matchingOffer = activeOffers.find(offer => {
      // a. Seller Ownership Check
      const offerSellerId = offer.sellerId?.toString() || offer.owner?.id?.toString();
      
      if (offer.owner?.type === 'seller' && offerSellerId) {
        if (!resolvedSellerIds.includes(offerSellerId)) return false;
      }

      // b. Applicability Type Check
      if (offer.applicableTo.type === 'all') return true;
      
      const applicableIds = (offer.applicableTo.ids || []).map(id => id.toString().toLowerCase());

      if (offer.applicableTo.type === 'product') {
        const prodId = (item.productId || '').toString().toLowerCase();
        const varId = (item.variantId || '').toString().toLowerCase();
        const itemId = (item._id || '').toString().toLowerCase();
        
        return (prodId && applicableIds.includes(prodId)) || 
               (varId && applicableIds.includes(varId)) ||
               (itemId && applicableIds.includes(itemId));
      }
      
      if (offer.applicableTo.type === 'category') {
        return item.subCategoryId && applicableIds.includes(item.subCategoryId.toString().toLowerCase());
      }
      
      return false;
    });

    if (matchingOffer) {
      const discountValue = parseFloat(matchingOffer.discountValue) || 0;
      if (matchingOffer.type === 'direct') {
        if (matchingOffer.discountType === 'percentage') {
          finalItemPrice = salePrice * (1 - discountValue / 100);
        } else {
          finalItemPrice = Math.max(0, salePrice - discountValue);
        }
        appliedOffer = matchingOffer.name;
      } else if (matchingOffer.type === 'quantity_tiered') {
        const tier = [...matchingOffer.tiers]
          .sort((a, b) => b.minQty - a.minQty)
          .find(t => item.qty >= t.minQty);
        
        if (tier) {
          const tierValue = parseFloat(tier.value) || 0;
          if (tier.discountType === 'percentage') {
            finalItemPrice = salePrice * (1 - tierValue / 100);
          } else {
            finalItemPrice = Math.max(0, salePrice - tierValue);
          }
          appliedOffer = `${matchingOffer.name} (Tier: ${item.qty}+ items)`;
        }
      }
    }

    const itemTotal = finalItemPrice * item.qty;
    totalOrderValue += itemTotal;

    return {
      ...item,
      resolvedSellerIds,
      originalPrice: price,
      sellerSalePrice: salePrice,
      finalPrice: finalItemPrice,
      itemTotal: itemTotal,
      appliedOffer: appliedOffer
    };
  }));

  // 3. Apply Coupon if provided
  let couponDiscount = 0;
  let appliedCoupon = null;
  let couponError = null;

  if (couponCode) {
    const coupon = await Coupon.findByCode(couponCode);
    if (coupon) {
      const now = new Date();
      
      // Global and Per-User Usage Limits
      const globalUsage = parseInt(coupon.usedCount) || 0;
      const globalLimit = coupon.usageLimit ? parseInt(coupon.usageLimit) : null;
      const userLimit = coupon.userLimit ? parseInt(coupon.userLimit) : null;
      
      if (globalLimit !== null && globalUsage >= globalLimit) {
        couponError = 'Coupon usage limit reached';
      } else if (userLimit !== null && userId) {
        const userUsage = await countCouponUsageByUser(userId, coupon.code);
        if (userUsage >= userLimit) {
          couponError = `You have already used this coupon ${userUsage} time(s)`;
        }
      }

      if (!couponError) {
        // Check if coupon is applicable to any item in the cart
        const applicableItems = processedItems.filter(item => {
          // 1. Seller Ownership Check
          const couponSellerId = coupon.sellerId?.toString() || coupon.owner?.id?.toString();
          
          if (coupon.owner?.type === 'seller' && couponSellerId) {
            if (!item.resolvedSellerIds.includes(couponSellerId)) return false;
          }

          // 2. Applicability Type Check
          if (!coupon.applicableTo || coupon.applicableTo.type === 'all') return true;
          
          const applicableIds = (coupon.applicableTo.ids || []).map(id => id.toString().toLowerCase());
          
          if (coupon.applicableTo.type === 'product') {
            const prodId = (item.productId || '').toString().toLowerCase();
            const varId = (item.variantId || '').toString().toLowerCase();
            const itemId = (item._id || '').toString().toLowerCase();

            return (prodId && applicableIds.includes(prodId)) || 
                   (varId && applicableIds.includes(varId)) ||
                   (itemId && applicableIds.includes(itemId));
          }
          
          if (coupon.applicableTo.type === 'category') {
            return item.subCategoryId && applicableIds.includes(item.subCategoryId.toString().toLowerCase());
          }
          
          return false;
        });

        if (applicableItems.length > 0) {
          const applicableTotal = applicableItems.reduce((acc, item) => acc + item.itemTotal, 0);
          const minOrderValue = parseFloat(coupon.minOrderValue) || 0;
          const discountValue = parseFloat(coupon.discountValue) || 0;
          const maxDiscountAmount = coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : null;

          if (coupon.expiryDate >= now) {
            if (totalOrderValue >= minOrderValue) {
              if (coupon.discountType === 'percentage') {
                couponDiscount = (applicableTotal * discountValue) / 100;
                if (maxDiscountAmount) {
                  couponDiscount = Math.min(couponDiscount, maxDiscountAmount);
                }
              } else {
                couponDiscount = Math.min(discountValue, applicableTotal);
              }
              appliedCoupon = coupon.code;
            } else {
              couponError = `Minimum order value of ${minOrderValue} not met`;
            }
          } else {
            couponError = 'Coupon has expired';
          }
        } else {
          couponError = 'Coupon is not applicable to any item in your cart';
        }
      }
    } else {
      couponError = 'Invalid coupon code';
    }
  }

  const grandTotal = totalOrderValue - couponDiscount;

  return {
    items: processedItems,
    subTotal: totalOrderValue,
    couponDiscount: couponDiscount,
    appliedCoupon: appliedCoupon,
    couponError: couponError,
    grandTotal: grandTotal
  };
}

module.exports = { calculateCartPrices };
