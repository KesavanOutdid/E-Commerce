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
  let platformIncentiveTotal = 0;

  const processedItems = await Promise.all(items.map(async (item) => {
    let price = item.price; // Original Price
    let salePrice = item.salePrice || item.price; // Seller's current sale price
    let finalItemPrice = salePrice;
    let appliedOffer = null;
    let itemPlatformIncentive = 0;

    // 1. Check for Active Offers (Direct or Tiered)
    const matchingOffer = activeOffers.find(offer => {
      if (offer.applicableTo.type === 'all') return true;
      if (offer.applicableTo.type === 'product') return offer.applicableTo.ids.includes(item.productId);
      if (offer.applicableTo.type === 'category') return offer.applicableTo.ids.includes(item.subCategoryId);
      return false;
    });

    if (matchingOffer) {
      if (matchingOffer.type === 'direct') {
        if (matchingOffer.discountType === 'percentage') {
          finalItemPrice = salePrice * (1 - matchingOffer.discountValue / 100);
        } else {
          finalItemPrice = Math.max(0, salePrice - matchingOffer.discountValue);
        }
        appliedOffer = matchingOffer.name;
      } else if (matchingOffer.type === 'quantity_tiered') {
        const tier = [...matchingOffer.tiers]
          .sort((a, b) => b.minQty - a.minQty)
          .find(t => item.qty >= t.minQty);
        
        if (tier) {
          if (tier.discountType === 'percentage') {
            finalItemPrice = salePrice * (1 - tier.value / 100);
          } else {
            finalItemPrice = Math.max(0, salePrice - tier.value);
          }
          appliedOffer = `${matchingOffer.name} (Tier: ${item.qty}+ items)`;
        }
      }

      // 2. Calculate Platform Incentive (Admin sharing the discount cost)
      if (matchingOffer.adminIncentivePercentage > 0) {
        const discountAmount = salePrice - finalItemPrice;
        itemPlatformIncentive = (discountAmount * matchingOffer.adminIncentivePercentage) / 100;
      }
    }

    const itemTotal = finalItemPrice * item.qty;
    totalOrderValue += itemTotal;
    platformIncentiveTotal += (itemPlatformIncentive * item.qty);

    return {
      ...item,
      originalPrice: price,
      sellerSalePrice: salePrice,
      finalPrice: finalItemPrice,
      itemTotal: itemTotal,
      appliedOffer: appliedOffer,
      platformIncentive: itemPlatformIncentive
    };
  }));

  // 3. Apply Coupon if provided
  let couponDiscount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findByCode(couponCode);
    if (coupon) {
      const now = new Date();
      if (coupon.expiryDate >= now && totalOrderValue >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = (totalOrderValue * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
          }
        } else {
          couponDiscount = Math.min(coupon.discountValue, totalOrderValue);
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
    platformIncentiveTotal: platformIncentiveTotal,
    grandTotal: grandTotal
  };
}

module.exports = { calculateCartPrices };
