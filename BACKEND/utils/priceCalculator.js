const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const SubCategory = require('../models/SubCategory');

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

    // 1. Check for Active Offers (Direct or Tiered)
    const matchingOffer = activeOffers.find(offer => {
      if (offer.applicableTo.type === 'all') return true;
      if (offer.applicableTo.type === 'product') return offer.applicableTo.ids.includes(item.productId);
      if (offer.applicableTo.type === 'category') return offer.applicableTo.ids.includes(item.subCategoryId);
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
      const minOrderValue = parseFloat(coupon.minOrderValue) || 0;
      const discountValue = parseFloat(coupon.discountValue) || 0;
      const maxDiscountAmount = coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : null;

      if (coupon.expiryDate >= now && totalOrderValue >= minOrderValue) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = (totalOrderValue * discountValue) / 100;
          if (maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, maxDiscountAmount);
          }
        } else {
          couponDiscount = Math.min(discountValue, totalOrderValue);
        }
        appliedCoupon = coupon.code;
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
