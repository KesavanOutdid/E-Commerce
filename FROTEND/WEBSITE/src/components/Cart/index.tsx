"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, AppDispatch } from "@/redux/store";
import SingleItem from "./SingleItem";
import CouponCard from "./CouponCard";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { fetchCart, clearCartServer, removeAllItemsFromCart, applyCoupon, selectTotalPrice, selectTotalGst, removeCoupon, selectTotalSavings, applyOffer, removeOffer, selectOfferDiscount } from "@/redux/features/cart-slice";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/lib/api";

const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalGst = useAppSelector(selectTotalGst);
  const totalSavings = useAppSelector(selectTotalSavings);
  const manualOfferDiscount = useAppSelector(selectOfferDiscount);
  const appliedCoupon = useAppSelector((state) => state.cartReducer.appliedCoupon);
  const appliedOffer = useAppSelector((state) => state.cartReducer.appliedOffer);
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [productCoupons, setProductCoupons] = useState<Record<string, any[]>>({});
  const [productOffers, setProductOffers] = useState<Record<string, any[]>>({});
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [hasInteractedWithCoupon, setHasInteractedWithCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchCart(accessToken));
    }
  }, [dispatch, isAuthenticated, accessToken]);

  const handleApplyCoupon = useCallback(async (codeToApply?: string, isAuto = false) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      if (!codeToApply) toast.error("Please enter a coupon code");
      return;
    }

    if (!isAuto) {
      setHasInteractedWithCoupon(true);
    }

    setIsApplying(true);
    try {
      await dispatch(
        applyCoupon({
          code: code,
          items: cartItems,
          subTotal: totalPrice,
          accessToken: accessToken || undefined,
        })
      ).unwrap();
      
      if (!isAuto) {
        toast.success("Coupon applied successfully!");
      }
      setCouponCode("");
    } catch (error: any) {
      // Show error toast for all manual applications (input or card click)
      if (!isAuto) {
        toast.error(error || "Invalid coupon code");
      }
      console.error("Coupon application failed:", error);
    } finally {
      setIsApplying(false);
    }
  }, [dispatch, couponCode, cartItems, totalPrice, accessToken]);

  // Fetch available coupons and offers for items in cart
  useEffect(() => {
    const fetchAvailablePromotions = async () => {
      if (cartItems.length === 0) return;
      
      try {
        const couponsMap = new Map();
        const offersMap = new Map();
        const prodCouponsMap: Record<string, any[]> = {};
        const prodOffersMap: Record<string, any[]> = {};
        
        await Promise.all(cartItems.map(async (item) => {
          // Fetch Coupons
          const couponUrl = new URL(API_ENDPOINTS.PRODUCT_COUPONS(item.productId));
          if (item.sellerProductId) couponUrl.searchParams.append("variantId", item.sellerProductId);
          
          const couponRes = await fetch(couponUrl.toString());
          const couponData = await couponRes.json();
          if (couponData.success && couponData.data) {
            prodCouponsMap[item.productId] = couponData.data;
            couponData.data.forEach((coupon: any) => {
              couponsMap.set(coupon.code, coupon);
            });
          }

          // Fetch Offers
          const offerUrl = new URL(API_ENDPOINTS.PRODUCT_PROMOTIONS(item.productId));
          if (item.sellerProductId) offerUrl.searchParams.append("variantId", item.sellerProductId);

          const offerRes = await fetch(offerUrl.toString());
          const offerData = await offerRes.json();
          if (offerData.success && offerData.data) {
            prodOffersMap[item.productId] = offerData.data;
            offerData.data.forEach((offer: any) => {
              offersMap.set(offer.offerId, offer);
            });
          }
        }));
        
        const coupons = Array.from(couponsMap.values());
        setAvailableCoupons(coupons);
        setAvailableOffers(Array.from(offersMap.values()));
        setProductCoupons(prodCouponsMap);
        setProductOffers(prodOffersMap);

        // Auto-apply if only one coupon exists and is applicable, AND user hasn't removed it
        if (coupons.length === 1 && !appliedCoupon && !hasInteractedWithCoupon) {
          const coupon = coupons[0];
          if (totalPrice >= coupon.minOrderValue) {
            console.log("Auto-applying single coupon:", coupon.code);
            handleApplyCoupon(coupon.code, true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      }
    };

    fetchAvailablePromotions();
  }, [cartItems, totalPrice, appliedCoupon, handleApplyCoupon, hasInteractedWithCoupon]);

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setHasInteractedWithCoupon(true);
    toast.success("Coupon removed");
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percentage") {
      return (totalPrice * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  };

  const discountAmount = calculateDiscount();
  const shippingFee = 150;
  
  const totalMrp = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const totalAutomaticDiscount = totalMrp - totalPrice;
  const grandTotal = totalPrice + totalGst + shippingFee - discountAmount - manualOfferDiscount;

  const handleApplyOffer = (offer: any) => {
    // Strictly separate code and name. 
    // If no explicit code, try to extract from name like "Offer (CODE)"
    let offerCode = offer.code || offer.offerCode || null;
    const offerName = offer.name || offer.offerName || "Promotion";

    if (!offerCode && offerName.includes("(") && offerName.includes(")")) {
      const match = offerName.match(/\(([^)]+)\)/);
      if (match) offerCode = match[1];
    }
    
    dispatch(applyOffer({
      offerId: offer.offerId,
      offerCode: offerCode,
      offerName: offerName,
      name: offerName,
      discountValue: offer.discountValue,
      discountType: offer.discountType,
      type: offer.type,
      tiers: offer.tiers
    }));
    toast.success(`${offerName} applied!`);
  };

  const handleRemoveOffer = () => {
    dispatch(removeOffer());
    toast.success("Offer removed");
  };

  const handleClearCart = async () => {
    if (isAuthenticated && accessToken) {
      try {
        await dispatch(clearCartServer(accessToken)).unwrap();
        toast.success("Cart cleared successfully");
      } catch (error: any) {
        toast.error(error || "Failed to clear cart");
      }
    } else {
      dispatch(removeAllItemsFromCart());
      toast.success("Cart cleared locally");
    }
  };

  return (
    <>
      {/* <!-- ===== Breadcrumb Section Start ===== --> */}
      <section>
        <Breadcrumb title={"Cart"} pages={["Cart"]} />
      </section>
      {/* <!-- ===== Breadcrumb Section End ===== --> */}
      {cartItems.length > 0 ? (
        <section className="overflow-hidden py-10 bg-gray-2">
          <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-5">
              <h2 className="font-normal text-dark text-2xl">Your Cart</h2>
              <button onClick={handleClearCart} className="text-[#2874f0] text-sm hover:underline">
                Clear Shopping Cart
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* <!-- Cart Items Column --> */}
              <div className="w-full lg:w-2/3">
                <div className="flex flex-col gap-4">
                  {cartItems.map((item, key) => (
                    <SingleItem 
                      item={item} 
                      key={key} 
                      coupons={productCoupons[item.productId] || []}
                      offers={productOffers[item.productId] || []}
                      appliedOffer={appliedOffer}
                      onApplyCoupon={handleApplyCoupon}
                      onApplyOffer={handleApplyOffer}
                      onRemoveOffer={handleRemoveOffer}
                    />
                  ))}
                </div>
              </div>

              {/* <!-- Order Summary Column --> */}
              <div className="w-full lg:w-1/3 lg:sticky lg:top-5">
                {/* Coupon Input */}
                <div className="bg-white shadow-1 rounded-xl p-6 mb-6">
                  <h3 className="font-normal text-[15px] text-dark mb-4">Have a Coupon?</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md">
                      <div>
                        <p className="text-green-700 font-medium">{appliedCoupon.code}</p>
                        <p className="text-green-600 text-xs">Applied Successfully</p>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 border border-gray-3 rounded-md px-4 py-2 focus:outline-none focus:border-blue text-sm"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplying}
                        className="bg-dark text-white px-4 py-2 rounded-md hover:bg-opacity-90 disabled:bg-opacity-50 text-sm font-medium"
                      >
                        {isApplying ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary Details */}
                <div className="bg-white shadow-1 rounded-xl overflow-hidden">
                  <div className="bg-gray-1 py-3 px-6 border-b border-gray-3">
                    <h3 className="font-normal text-[15px] text-dark">Order Summary</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total MRP</span>
                        <span className="text-dark font-medium line-through decoration-gray-400 text-gray-400">₹{totalMrp.toLocaleString()}</span>
                      </div>
                      {totalAutomaticDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Product Discount</span>
                          <span>-₹{totalAutomaticDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      {manualOfferDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Offer ({appliedOffer?.name})</span>
                          <span>-₹{manualOfferDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-dark font-medium">₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GST (18%)</span>
                        <span className="text-dark font-medium">₹{totalGst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping Fee</span>
                        <span className="text-dark font-medium">₹{shippingFee.toLocaleString()}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-blue font-medium">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {totalSavings > 0 && (
                        <div className="bg-green-50 p-2.5 rounded-md mt-4 border border-green-100">
                          <p className="text-green-700 text-[12px] font-medium text-center">
                            Total Savings: ₹{totalSavings.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-dark pt-4 border-t border-gray-3 mt-4">
                        <span>Total Amount</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="w-full flex justify-center font-medium text-white bg-blue py-3 px-10 rounded-md mt-8 ease-out duration-200 hover:bg-opacity-90"
                    >
                      Proceed to Checkout
                    </Link>
                    
                    <Link
                      href="/shop"
                      className="w-full flex justify-center font-medium text-dark bg-gray-2 py-3 px-10 rounded-md mt-4 ease-out duration-200 hover:bg-gray-3"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="text-center mt-8">
            <div className="mx-auto pb-7.5">
              <svg
                className="mx-auto"
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M36.1693 36.2421C35.6126 36.0565 35.0109 36.3574 34.8253 36.9141C34.6398 37.4707 34.9406 38.0725 35.4973 38.258L35.8726 38.3831C36.8308 38.7025 37.4644 38.9154 37.9311 39.1325C38.373 39.3381 38.5641 39.5036 38.6865 39.6734C38.809 39.8433 38.9055 40.0769 38.9608 40.5612C39.0192 41.0726 39.0208 41.7409 39.0208 42.751L39.0208 46.5361C39.0208 48.4735 39.0207 50.0352 39.1859 51.2634C39.3573 52.5385 39.7241 53.6122 40.5768 54.4649C41.4295 55.3176 42.5032 55.6844 43.7783 55.8558C45.0065 56.0209 46.5681 56.0209 48.5055 56.0209H59.9166C60.5034 56.0209 60.9791 55.5452 60.9791 54.9584C60.9791 54.3716 60.5034 53.8959 59.9166 53.8959H48.5833C46.5498 53.8959 45.1315 53.8936 44.0615 53.7498C43.022 53.61 42.4715 53.3544 42.0794 52.9623C41.9424 52.8253 41.8221 52.669 41.7175 52.4792H55.7495C56.3846 52.4792 56.9433 52.4793 57.4072 52.4292C57.9093 52.375 58.3957 52.2546 58.8534 51.9528C59.3111 51.651 59.6135 51.2513 59.8611 50.8111C60.0898 50.4045 60.3099 49.891 60.56 49.3072L61.2214 47.7641C61.766 46.4933 62.2217 45.4302 62.4498 44.5655C62.6878 43.6634 62.7497 42.7216 62.1884 41.8704C61.627 41.0191 60.737 40.705 59.8141 40.5684C58.9295 40.4374 57.7729 40.4375 56.3903 40.4375L41.0845 40.4375C41.0806 40.3979 41.0765 40.3588 41.0721 40.3201C40.9937 39.6333 40.8228 39.0031 40.4104 38.4309C39.998 37.8588 39.4542 37.4974 38.8274 37.2058C38.2377 36.9315 37.4879 36.6816 36.6005 36.3858L36.1693 36.2421ZM41.1458 42.5625C41.1458 42.6054 41.1458 42.6485 41.1458 42.692L41.1458 46.4584C41.1458 48.1187 41.1473 49.3688 41.2262 50.3542H55.6975C56.4 50.3542 56.8429 50.3528 57.1791 50.3165C57.4896 50.2829 57.6091 50.2279 57.6836 50.1787C57.7582 50.1296 57.8559 50.0415 58.009 49.7692C58.1748 49.4745 58.3506 49.068 58.6273 48.4223L59.2344 47.0057C59.8217 45.6355 60.2119 44.7177 60.3951 44.0235C60.5731 43.3488 60.4829 43.1441 60.4143 43.0401C60.3458 42.9362 60.1931 42.7727 59.5029 42.6705C58.7927 42.5653 57.7954 42.5625 56.3047 42.5625H41.1458Z"
                  fill="#8D93A5"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M40.4375 60.625C40.4375 62.3855 41.8646 63.8125 43.625 63.8125C45.3854 63.8125 46.8125 62.3855 46.8125 60.625C46.8125 58.8646 45.3854 57.4375 43.625 57.4375C41.8646 57.4375 40.4375 58.8646 40.4375 60.625ZM43.625 61.6875C43.0382 61.6875 42.5625 61.2118 42.5625 60.625C42.5625 60.0382 43.0382 59.5625 43.625 59.5625C44.2118 59.5625 44.6875 60.0382 44.6875 60.625C44.6875 61.2118 44.2118 61.6875 43.625 61.6875Z"
                  fill="#8D93A5"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M56.375 63.8126C54.6146 63.8126 53.1875 62.3856 53.1875 60.6251C53.1875 58.8647 54.6146 57.4376 56.375 57.4376C58.1354 57.4376 59.5625 58.8647 59.5625 60.6251C59.5625 62.3856 58.1354 63.8126 56.375 63.8126ZM55.3125 60.6251C55.3125 61.212 55.7882 61.6876 56.375 61.6876C56.9618 61.6876 57.4375 61.212 57.4375 60.6251C57.4375 60.0383 56.9618 59.5626 56.375 59.5626C55.7882 59.5626 55.3125 60.0383 55.3125 60.6251Z"
                  fill="#8D93A5"
                />
              </svg>
            </div>

            <p className="pb-6">Your cart is empty!</p>

            <Link
              href="/shop"
              className="w-96 mx-auto flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
