import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { removeCartItemServer, updateCartItemServer } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const SingleItem = ({ item }) => {
  const dispatch = useAppDispatch();
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const { closeCartModal } = useCartModalContext();

  const handleRemoveFromCart = () => {
    if (isAuthenticated && accessToken) {
      dispatch(removeCartItemServer({ productId: item.productId, accessToken }));
    }
  };

  const handleUpdateQuantity = (newQty: number) => {
    if (newQty < 1) return;
    if (isAuthenticated && accessToken) {
      const totalPrice = item.discountedPrice * newQty;
      const gst = 0; // Following the pattern in cart-slice.ts
      const subTotal = totalPrice;
      
      dispatch(updateCartItemServer({ 
        productId: item.productId, 
        qty: newQty, 
        totalPrice, 
        gst, 
        subTotal, 
        accessToken 
      }));
    }
  };

  return (
    <div className="flex items-center justify-between gap-5 border-b border-gray-2 pb-4 last:border-0">
      <div className="w-full flex items-center gap-4">
        <div className="flex items-center justify-center rounded-lg bg-gray-100 p-2 min-w-[80px] h-[80px]">
          <Link href={`/shop-details/${item.id}`} onClick={() => closeCartModal()}>
            <Image 
              src={item.imgs?.thumbnails[0] || "/images/product/placeholder.jpg"} 
              alt={item.title} 
              width={60} 
              height={60} 
              className="object-contain"
            />
          </Link>
        </div>

        <div className="flex-grow max-w-[230px] overflow-hidden">
          <h3 className="font-medium text-dark text-sm mb-1 line-clamp-1">
            <Link href={`/shop-details/${item.id}`} onClick={() => closeCartModal()} className="hover:text-blue transition-colors">
              {item.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 mb-2">₹{item.discountedPrice}</p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-dark"
            >
              -
            </button>
            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
            <button 
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-dark"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleRemoveFromCart}
        aria-label="Remove product"
        className="text-gray-400 hover:text-red transition-colors p-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
};

export default SingleItem;
