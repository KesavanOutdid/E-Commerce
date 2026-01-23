const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

/**
 * Calculates the layered price for a set of cart items.
 * Layers: 1. Base Discount (Sale Price) 
 *         2. Tiered/Quantity Offers
 *         3. Platform Incentives
 *         4. Coupons (Applied at the end)
 */
async function calculateCartPrices(items, couponCode = null) {
  const activeOffers = await Offer.findActive();
  let totalOrderValue = 0;
  let totalDiscount = 0;

  const processedItems = await Promise.all(items.map(async (item) => {
    let price = parseFloat(item.price) || 0; // Original Price
    let salePrice = parseFloat(item.salePrice || item.price) || 0; // Seller's current sale price
    let finalItemPrice = salePrice;
    let appliedOffer = null;
    let resolvedSellerId = item.sellerId;

    // Resolve sellerId if missing
    if (!resolvedSellerId) {
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (variant) resolvedSellerId = variant.sellerId || variant.userId;
      } else if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product) resolvedSellerId = product.sellerId || product.userId;
      }
    }

    // 1. Check for Active Offers (Direct or Tiered)
    const matchingOffer = activeOffers.find(offer => {
      // a. Seller Ownership Check
      const offerSellerId = offer.sellerId?.toString() || offer.owner?.id?.toString();
      const itemSellerId = resolvedSellerId?.toString();
      
      if (offer.owner?.type === 'seller' && offerSellerId && itemSellerId) {
        if (offerSellerId !== itemSellerId) return false;
      }

      // b. Applicability Type Check
      if (offer.applicableTo.type === 'all') return true;
      
      const applicableIds = (offer.applicableTo.ids || []).map(id => id.toString().toLowerCase());

      if (offer.applicableTo.type === 'product') {
        return (item.productId && applicableIds.includes(item.productId.toString().toLowerCase())) || 
               (item.variantId && applicableIds.includes(item.variantId.toString().toLowerCase())) ||
               (item._id && applicableIds.includes(item._id.toString().toLowerCase()));
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
      sellerId: resolvedSellerId,
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

  if (couponCode) {
    const coupon = await Coupon.findByCode(couponCode);
    if (coupon) {
      const now = new Date();
      
      // Check if coupon is applicable to any item in the cart
      const applicableItems = processedItems.filter(item => {
        // 1. Seller Ownership Check
        // If coupon belongs to a seller, it can only be applied to that seller's products
        const couponSellerId = coupon.sellerId?.toString() || coupon.owner?.id?.toString();
        const itemSellerId = item.sellerId?.toString();
        
        // If it's a seller coupon, ensure it matches the item's seller
        if (coupon.owner?.type === 'seller' && couponSellerId && itemSellerId) {
          if (couponSellerId !== itemSellerId) return false;
        } else if (coupon.owner?.type === 'seller' && !itemSellerId) {
          // If it's a seller coupon but we couldn't resolve item seller, don't apply for safety
          return false;
        }

        // 2. Applicability Type Check
        if (!coupon.applicableTo || coupon.applicableTo.type === 'all') return true;
        
        const applicableIds = (coupon.applicableTo.ids || []).map(id => id.toString().toLowerCase());
        
        if (coupon.applicableTo.type === 'product') {
          // Check against Product ID, Variant ID, or Item ID (UUID strings)
          return (item.productId && applicableIds.includes(item.productId.toString().toLowerCase())) || 
                 (item.variantId && applicableIds.includes(item.variantId.toString().toLowerCase())) ||
                 (item._id && applicableIds.includes(item._id.toString().toLowerCase()));
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

        if (coupon.expiryDate >= now && totalOrderValue >= minOrderValue) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (applicableTotal * discountValue) / 100;
            if (maxDiscountAmount) {
              couponDiscount = Math.min(couponDiscount, maxDiscountAmount);
            }
          } else {
            couponDiscount = Math.min(discountValue, applicableTotal);
          }
          appliedCoupon = coupon.code;
        }
      }
    }
  }

  const grandTotal = totalOrderValue - couponDiscount;

  return {
    items: processedItems,
    subTotal: totalOrderValue,
    couponDiscount: couponDiscount,
    appliedCoupon: appliedCoupon,
    grandTotal: grandTotal
  };
}

module.exports = { calculateCartPrices };
