"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface ProductItemProps {
  item: Product;
  variant?: "default" | "bestseller";
}

const ProductItem = ({ item, variant = "default" }: ProductItemProps) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  // Extract values from both structures safely
  const isNewStructure = !!item.product;
  const product = item.product;

  const id = isNewStructure ? product?._id : item.id;
  const title = isNewStructure ? product?.productName : item.title;
  const reviews = isNewStructure ? product?.totalReviews : item.reviews;
  const displayPrice = isNewStructure ? (product?.minPriceDetails?.price ?? 0) : item.discountedPrice;
  const originalPrice = isNewStructure ? product?.price : item.price;
  const deliveryDays = isNewStructure ? product?.minPriceDetails?.deliveryDays : null;
  
  const productImage = isNewStructure 
    ? (product?.images?.[0] ? `${API_BASE_URL}${product.images[0]}` : "/images/placeholder.png")
    : (item.imgs?.previews?.[0] ?? "/images/placeholder.png");

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  if (variant === "bestseller") {
    return (
      <div className="group">
        <Link href={`/shop-details/${id}`} className="block">
          <div className="relative overflow-hidden rounded-lg bg-[#F6F7FB] h-[270px] mb-1">
            <Image 
              src={productImage} 
              alt={title || "product image"} 
              fill 
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Image
                key={i}
                src="/images/icons/icon-star.svg"
                alt="star icon"
                width={14}
                height={14}
              />
            ))}
          </div>
          <p className="text-custom-sm">({reviews})</p>
        </div>

        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5 line-clamp-1">
          <Link href={`/shop-details/${id}`}> {title} </Link>
        </h3>

        <span className="flex items-center gap-2 font-medium text-lg">
          <span className="text-dark">₹{displayPrice}</span>
          {Number(originalPrice) > Number(displayPrice) && (
            <span className="text-dark-4 line-through">₹{originalPrice}</span>
          )}
        </span>

        {deliveryDays && (
          <p className="text-custom-sm text-blue mt-1 flex items-center gap-1">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Delivery in {deliveryDays} days
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="group">
      <Link href={`/shop-details/${id}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-[#F6F7FB] h-[270px] mb-1">
          <Image 
            src={productImage} 
            alt={title || "product image"} 
            fill 
            className="object-contain p-6"
          />

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
         
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Image
              key={i}
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={14}
              height={14}
            />
          ))}
        </div>

        <p className="text-custom-sm">({reviews})</p>
      </div>

      <h3
        className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5 line-clamp-1"
      >
        <Link href={`/shop-details/${id}`}> {title} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">₹{displayPrice}</span>
        {Number(originalPrice) > Number(displayPrice) && (
          <span className="text-dark-4 line-through">₹{originalPrice}</span>
        )}
      </span>

      {deliveryDays && (
        <p className="text-custom-sm text-blue mt-1 flex items-center gap-1">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          Delivery in {deliveryDays} days
        </p>
      )}
    </div>
  );
};

export default ProductItem;
