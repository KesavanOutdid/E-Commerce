"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import { useDispatch } from "react-redux";
import { setWishlist } from "@/redux/features/wishlist-slice";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || !accessToken) return;

      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.WISHLIST, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          const transformedItems = data.data.map((product: any) => ({
            id: product.productId,
            _id: product._id,
            title: product.productName,
            price: parseFloat(product.price),
            discountedPrice: product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price),
            quantity: 1,
            status: parseInt(product.stock) > 0 ? "In Stock" : "Out of Stock",
            imgs: {
              thumbnails: product.images?.map((img: string) => `${API_BASE_URL}${img}`) || [],
              previews: product.images?.map((img: string) => `${API_BASE_URL}${img}`) || [],
            },
          }));
          dispatch(setWishlist(transformedItems));
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [accessToken, isAuthenticated, dispatch]);

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button className="text-blue">Clear Wishlist Cart</button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[400px]">
                    <p className="text-dark font-medium">Product</p>
                  </div>

                  <div className="min-w-[265px] text-center">
                    <p className="text-dark font-medium">Stock Status</p>
                  </div>

                  <div className="min-w-[205px] text-center">
                    <p className="text-dark font-medium">Unit Price</p>
                  </div>

                  <div className="min-w-[230px]">
                    <p className="text-dark font-medium text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {loading ? (
                  <div className="p-10 text-center text-dark">Loading your wishlist...</div>
                ) : wishlistItems.length > 0 ? (
                  wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))
                ) : (
                  <div className="p-10 text-center text-dark">Your wishlist is empty.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
