import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  removeCartItemServer,
  updateCartItemServer,
} from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

const SingleItem = ({ 
  item, 
  coupons = [], 
  offers = [], 
  appliedOffer = null,
  onApplyCoupon, 
  onApplyOffer,
  onRemoveOffer
}: { 
  item: any, 
  coupons?: any[], 
  offers?: any[],
  appliedOffer?: any,
  onApplyCoupon?: (code: string) => void,
  onApplyOffer?: (offer: any) => void,
  onRemoveOffer?: () => void
}) => {
  const dispatch = useAppDispatch();
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [showAllOffers, setShowAllOffers] = useState(false);

  const handleRemoveFromCart = async () => {
    if (isAuthenticated && accessToken) {
      try {
        await dispatch(removeCartItemServer({ 
          productId: item.productId, 
          variantId: item.sellerProductId,
          accessToken 
        })).unwrap();
        toast.success("Item removed from cart");
      } catch (error: any) {
        toast.error(error || "Failed to remove item");
      }
    }
  };

  const handleUpdateQuantity = async (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > 3) {
      toast.error("Maximum 3 items allowed");
      return;
    }
    if (isAuthenticated && accessToken) {
      const totalPrice = item.discountedPrice * newQty;
      const gst = 0;
      const subTotal = totalPrice;
      
      try {
        await dispatch(updateCartItemServer({ 
          productId: item.productId, 
          sellerProductId: item.sellerProductId,
          qty: newQty, 
          totalPrice, 
          gst, 
          subTotal, 
          accessToken 
        })).unwrap();
        toast.success("Cart updated");
      } catch (error: any) {
        toast.error(error || "Failed to update quantity");
      }
    }
  };

  return (
    <div className="flex flex-col rounded-xl shadow-sm py-8 px-6 bg-white min-h-[220px]">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="w-28 h-28 flex-shrink-0 relative bg-gray-2 rounded-[5px] overflow-hidden">
          <Link href={`/shop-details/${item.productId}`}>
            <Image 
              width={112}
              height={112}
              src={item.imgs?.thumbnails[0] || "/images/product/placeholder.jpg"} 
              alt={item.title} 
              className="object-contain w-full h-full p-2"
            />
          </Link>
        </div>

        {/* Product Details */}
        <div className="flex-grow flex flex-col">
          <h3 className="text-dark hover:text-blue ease-out duration-200 line-clamp-1 text-[17px] font-medium">
            <Link href={`/shop-details/${item.productId}`}> {item.title} </Link>
          </h3>
          
          {/* Promotions Section */}
          <div className="mt-3 flex flex-col gap-2">
            {/* Offers Row */}
            {offers.length > 0 && (
              <div className="flex items-center flex-wrap gap-x-2">
                <span className="text-[12px] font-bold text-[#388e3c] flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                  </svg>
                  {offers.length} Offers:
                </span>
                <div className="flex items-center gap-1">
                  {offers.slice(0, 3).map((offer: any, idx) => (
                    <span key={offer.offerId} className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                       {offer.name}{idx < Math.min(offers.length, 3) - 1 ? ',' : ''}
                    </span>
                  ))}
                  {offers.length > 3 && (
                    <span className="text-[11px] text-blue font-bold ml-1">+{offers.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Coupons Row */}
            {coupons.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-normal text-dark flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  </svg>
                  {coupons.length} Coupons Available
                </span>
              </div>
            )}

            {(offers.length > 0 || coupons.length > 0) && (
              <button 
                onClick={() => setShowAllOffers(!showAllOffers)}
                className="w-fit text-[10px] font-semibold text-blue hover:underline uppercase tracking-wider mt-1 transition-colors"
              >
                {showAllOffers ? "Collapse Offers" : "View All Offers & Coupons"}
              </button>
            )}

            {showAllOffers && (
              <div className="mt-4 bg-slate-50 border border-black/[0.06] rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/[0.04]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <h3 className="font-semibold text-[14px] text-dark">Available Promotions</h3>
                </div>
                
                <div className="space-y-4">
                  {offers.map((offer: any) => {
                    const isSelected = appliedOffer?.offerId === offer.offerId;
                    return (
                      <div key={offer.offerId} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 text-[#388e3c]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                          </svg>
                        </div>
                        <div className="flex-grow flex flex-col min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="mt-1 flex flex-col">
                              <p className="text-[13px] text-gray-900 leading-snug">
                                <span className="font-semibold text-gray-800 font-serif tracking-tight">{offer.name}:</span> {offer.description}
                                <span className="text-green-700 font-bold ml-1.5 whitespace-nowrap">
                                  Save {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                                </span>
                              </p>
                              {offer.type === 'quantity_tiered' && offer.tiers && offer.tiers.length > 0 && (
                                <div className="mt-1.5 pl-1 border-l-2 border-green-100">
                                  <ul className="space-y-1">
                                    {offer.tiers.map((tier: any, tIdx: number) => (
                                      <li key={tIdx} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                        <span className="w-1 h-1 bg-green-300 rounded-full"></span>
                                        <span>Buy <span className="font-bold text-gray-800">{tier.minQty}+</span> items: <span className="font-bold text-green-600">{tier.discountType === 'percentage' ? `${tier.value}%` : `₹${tier.value}`} Off</span></span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => isSelected ? onRemoveOffer?.() : onApplyOffer?.(offer)}
                              className={`text-[12px] font-bold uppercase tracking-tight px-3 py-1 rounded transition-all whitespace-nowrap ${isSelected ? 'text-red hover:bg-red/5' : 'text-blue hover:bg-blue/5'}`}
                            >
                              {isSelected ? 'Remove' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {coupons.length > 0 && <div className="border-t border-gray-100 my-2"></div>}
                  
                  {coupons.map((coupon: any) => (
                    <div key={coupon.couponId} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 text-[#2874f0]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                        </svg>
                      </div>
                      <div className="flex-grow flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-[13px] text-gray-900 leading-snug">
                            <span className="font-medium uppercase bg-blue/5 text-[#2874f0] px-1.5 py-0.5 rounded border border-black/[0.08] mr-1.5">{coupon.code}</span>
                            <span className="font-bold">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} Off</span> • {coupon.description}
                          </p>
                          <button 
                            onClick={() => onApplyCoupon?.(coupon.code)}
                            className="text-[12px] font-bold uppercase tracking-tight text-blue px-3 py-1 rounded hover:bg-blue/5 transition-all whitespace-nowrap"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Price, Quantity, Delete */}
          <div className="mt-auto pt-6 flex items-end justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-dark">₹{item.discountedPrice}</span>
                {item.price > item.discountedPrice && (
                  <>
                    <span className="text-gray-400 text-[15px] line-through">₹{item.price}</span>
                    <span className="text-[#388e3c] text-[14px] font-bold">
                      {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-3 rounded-[4px] overflow-hidden shadow-sm">
                <button
                  onClick={() => handleUpdateQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center bg-gray-2 hover:bg-gray-3 text-dark disabled:opacity-30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
                </button>
                <span className="w-10 text-center text-[14px] font-bold text-dark">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.quantity + 1)}
                  disabled={item.quantity >= 3}
                  className="w-8 h-8 flex items-center justify-center bg-gray-2 hover:bg-gray-3 text-dark disabled:opacity-30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>

              {/* Delete Link */}
              <button
                onClick={handleRemoveFromCart}
                className="text-[15px] font-medium uppercase text-dark hover:text-red flex items-center gap-2 transition-colors group"
              >
                <svg className="group-hover:stroke-red transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
