"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/features/cart-slice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";

const SellersList = ({ productId }: { productId: string }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.authReducer);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PRODUCT_DETAILS(productId));
        const data = await response.json();
        if (data.success) {
          setProduct(data.data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = (seller: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      router.push("/signin");
      return;
    }

    dispatch(
      addToCart({
        item: {
          id: product.productId,
          title: product.productName,
          price: seller.price,
          discountedPrice: seller.salePrice || seller.price,
          imgs: {
            thumbnails: product.images?.map((img: string) => `${API_BASE_URL}${img}`) || [],
          },
          sellerId: seller.sellerId,
          sellerProductId: seller.sellerProductId,
          sellerName: seller.sellerName,
          quantity: 1,
        },
        accessToken,
        isAuthenticated,
      })
    );
    toast.success(`Added to cart from ${seller.sellerName}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-dark">Product not found</div>;
  }

  const allSellers = (product.allOffers || []).map((offer: any) => ({
    ...offer,
    price: offer.price,
    salePrice: offer.price, // allOffers already has the final price
    deliveryDays: offer.deliveryDays || 3,
    sellerProductId: offer.sellerProductId,
    isCurrent: offer.sellerId === product.minPriceDetails?.sellerId
  }));

  return (
    <div className="bg-gray-2 pb-20 pt-6">
      <Breadcrumb title={"Sellers"} pages={["shop details", product.productName, "sellers"]} />
      
      <div className="max-w-[1350px] w-full mx-auto px-4 sm:px-8 xl:px-0 mt-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue transition-colors mb-5 w-fit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          BACK
        </button>

        <div className="bg-white rounded-xl shadow-1 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-3 bg-gray-50 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-dark">{product.productName}</h1>
              <p className="text-sm text-gray-500 mt-1">Available Sellers ({allSellers.length})</p>
            </div>
            {product.images?.[0] && (
              <div className="w-16 h-16 relative rounded-lg border border-gray-3 p-1 bg-white">
                <Image
                  src={`${API_BASE_URL}${product.images[0]}`}
                  alt={product.productName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Sellers Table UI */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Seller Details</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-3">Delivery</div>
            <div className="col-span-2 text-center">Action</div>
          </div>

          <div className="divide-y divide-gray-2">
            {allSellers.map((seller, index) => {
              const isCurrent = seller.isCurrent;
              return (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-6 transition-colors group ${isCurrent ? "bg-blue/5" : "hover:bg-gray-50"}`}>
                  {/* Seller Info */}
                  <div className="col-span-1 md:col-span-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-blue text-base hover:underline cursor-pointer" onClick={() => router.push(`/shop-details/${seller.sellerProductId || productId}`)}>
                        {seller.sellerName}
                      </span>
                      {isCurrent && (
                        <span className="text-blue text-[10px]  uppercase tracking-wider">[Best Price]</span>
                      )}
                      {!seller.isSeller && (
                        <span className="text-green-600 text-[10px]  uppercase tracking-wider">[Original]</span>
                      )}
                    </div>
                    {seller.shopName && <p className="text-xs text-gray-400 mt-0.5">{seller.shopName}</p>}
                  </div>

                  {/* Price Info */}
                  <div className="col-span-1 md:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-dark">₹{seller.price}</span>
                    </div>
                    {seller.stock > 0 ? (
                      <span className="text-green-600 text-[10px] font-bold uppercase tracking-wider">In Stock ({seller.stock})</span>
                    ) : (
                      <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="col-span-1 md:col-span-3 flex flex-col justify-center">
                    <p className="text-sm text-dark font-medium flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      Delivery in {seller.deliveryDays} days
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleAddToCart(seller)}
                      className="w-full md:w-auto bg-blue text-white px-5 py-2.5 rounded font-bold text-[10px] hover:bg-blue-dark transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      ADD TO CART
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellersList;
