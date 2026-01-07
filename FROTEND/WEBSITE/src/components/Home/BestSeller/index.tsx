"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import Link from "next/link";
import { API_ENDPOINTS } from "@/lib/api";
import { Product } from "@/types/product";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.BEST_SELLERS}?limit=20`);
        const result = await response.json();
        if (result.success) {
          setProducts(result.data.products);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc: { [key: string]: Product[] }, item) => {
    const categoryName = item.product?.mainCategoryName || "Other";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  return (
    <section id="best-selling-products" className="overflow-hidden pb-20 scroll-mt-31">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-6">
          <span className="flex items-center gap-2.5 font-medium text-dark text-lg mb-1.5">
            <Image
              src="/images/icons/icon-07.svg"
              alt="icon"
              width={17}
              height={17}
            />
            Top Selling Products
          </span>
         
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
          </div>
        ) : Object.keys(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([categoryName, items]) => (
            <div key={categoryName} className="mb-15 last:mb-0">
              <div className="flex items-center justify-between mb-6 border-b border-gray-3 pb-4">
                <h3 className="font-semibold text-md xl:text-xl text-dark uppercase tracking-wide">
                  {categoryName}
                </h3>
            
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5">
                {items.slice(0, 4).map((item, key) => (
                  <ProductItem item={item} key={key} variant="bestseller" />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-10">No best selling products found.</p>
        )}

     
      </div>
    </section>
  );
};

export default BestSeller;
