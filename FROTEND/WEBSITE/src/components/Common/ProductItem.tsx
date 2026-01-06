"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";

interface ProductItemProps {
  item: Product;
  variant?: "default" | "bestseller";
}

const ProductItem = ({ item, variant = "default" }: ProductItemProps) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  if (variant === "bestseller") {
    return (
      <div className="group">
        <div className="relative overflow-hidden rounded-lg bg-[#F6F7FB] h-[403px] flex flex-col">
          <div className="text-center px-4 py-7.5">
            <div className="flex items-center justify-center gap-2.5 mb-2">
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
              <p className="text-custom-sm">({item.reviews})</p>
            </div>

            <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5 line-clamp-1">
              <Link href={`/shop-details/${item.id}`}> {item.title} </Link>
            </h3>

            <span className="flex items-center justify-center gap-2 font-medium text-lg">
              <span className="text-dark">₹{item.discountedPrice}</span>
              <span className="text-dark-4 line-through">₹{item.price}</span>
            </span>
          </div>

          <div className="relative flex-grow mb-6">
            <Image 
              src={item.imgs.previews[0]} 
              alt={item.title} 
              fill 
              className="object-contain p-4"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <Link href={`/shop-details/${item.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-[#F6F7FB] h-[270px] mb-1">
          <Image 
            src={item.imgs.previews[0]} 
            alt={item.title} 
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

        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      <h3
        className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5 line-clamp-1"
      >
        <Link href={`/shop-details/${item.id}`}> {item.title} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">₹{item.discountedPrice}</span>
        <span className="text-dark-4 line-through">₹{item.price}</span>
      </span>
    </div>
  );
};

export default ProductItem;
