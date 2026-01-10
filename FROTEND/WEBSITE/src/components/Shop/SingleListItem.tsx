"use client";
import React from "react";

import { Product } from "@/types/product";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

const SingleListItem = ({ item }: { item: Product }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Extract values from both structures safely
  const productData = item.product || item;

  const id = (productData as any)._id || (productData as any).productId || (item as any).id;
  const title = (productData as any).productName || (item as any).title;
  const reviews = (productData as any).totalReviews || (item as any).reviews || 0;
  const highlights = (productData as any).highlights || [];
  
  const displayPrice = (productData as any).minPriceDetails?.salePrice ?? (productData as any).minPriceDetails?.price ?? (item as any).discountedPrice ?? 0;
  const originalPrice = (productData as any).minPriceDetails?.price ?? (item as any).price ?? 0;
  const deliveryDays = (productData as any).minPriceDetails?.deliveryDays || null;

  const productImage = (productData as any).images?.[0]
    ? `${API_BASE_URL}${(productData as any).images[0]}`
    : ((productData as any).minPriceDetails?.images?.[0]
      ? `${API_BASE_URL}${(productData as any).minPriceDetails.images[0]}`
      : ((item as any).imgs?.previews?.[0] ?? "/images/placeholder.png"));

  // add to cart
  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      })
    );
  };

  return (
    <div className="group rounded-lg bg-white shadow-1 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left Section: Image */}
        <Link href={`/shop-details/${id}`} className="block w-full md:max-w-[270px] shrink-0">
          <div className="relative overflow-hidden h-[170px] md:h-[190px] p-3 bg-[#F6F7FB]">
            <Image 
              src={productImage} 
              alt={title || "product image"} 
              fill 
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
            
            <button
              onClick={(e) => {
                e.preventDefault();
                handleItemToWishList();
              }}
              aria-label="Add to wishlist"
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full shadow-1 ease-out duration-200 text-dark bg-white hover:text-red-500 z-10"
            >
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                  fill=""
                />
              </svg>
            </button>
          </div>
        </Link>

        {/* Middle & Right Section: Details */}
        <div className="flex-1 flex flex-col md:flex-row p-3 md:p-4 gap-4">
          {/* Middle: Name & Highlights */}
          <div className="flex-1">
            <h3 className="text-base text-dark hover:text-blue transition-colors mb-1.5 line-clamp-1">
              <Link href={`/shop-details/${id}`}> {title} </Link>
            </h3>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                <span>4.5</span>
                <Image src="/images/icons/icon-star.svg" alt="star" width={10} height={10} className="brightness-0 invert" />
              </div>
              <p className="text-gray-500 text-sm font-medium">({reviews} Reviews)</p>
            </div>

            {/* Highlights List */}
            {highlights && highlights.length > 0 && (
              <ul className="space-y-1 mt-2.5">
                {highlights.slice(0, 4).map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-dark/40 shrink-0"></span>
                    <span className="leading-tight line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Section: Price & Actions */}
          <div className="md:w-[200px] flex flex-col">
            <div className="mb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-bold text-dark">₹{displayPrice.toLocaleString()}</span>
                {Number(originalPrice) > Number(displayPrice) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through text-xs">₹{originalPrice.toLocaleString()}</span>
                    <span className="text-green-600 text-xs font-bold">
                      {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% off
                    </span>
                  </div>
                )}
              </div>
              
              {deliveryDays && (
                <p className="text-xs text-blue-600 mt-1.5 font-medium">
                  Delivery in {deliveryDays} days
                </p>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition-colors text-sm uppercase"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
