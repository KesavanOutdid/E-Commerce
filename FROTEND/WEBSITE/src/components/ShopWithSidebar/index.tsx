"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CustomSelect from "./CustomSelect";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

const ShopWithSidebar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subcategory = searchParams.get("subcategory");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productStyle, setProductStyle] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let baseUrl = API_ENDPOINTS.PRODUCTS;
        if (subcategory) {
          baseUrl = API_ENDPOINTS.PRODUCTS_BY_SUBCATEGORY(subcategory);
        }
        
        // Add page and limit to the URL
        const separator = baseUrl.includes("?") ? "&" : "?";
        const url = `${baseUrl}${separator}page=${currentPage}&limit=12`;
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          const productsData = Array.isArray(data.data) ? data.data : (data.data.products || []);
          setProducts(productsData);
          if (data.data.pagination) {
            setPaginationData(data.data.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategory, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  return (
    <>
      <section className="overflow-hidden relative pb-20 pt-[140px] bg-[#f3f4f6]">
        <div className="max-w-full w-full mx-auto px-4 sm:px-8 xl:px-15">
          <div className="w-full">
            {/* // <!-- Content Start --> */}
            <div className="w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => router.back()}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f4f6] hover:bg-gray-200 transition-colors text-dark"
                      title="Go Back"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <h3 className="text-md text-dark">
                      {subcategory ? `Premium Collection: ${subcategory}` : "Premium Collection: Explore Our Quality Products"}
                    </h3>
                  </div>

                  {/* <!-- top bar right --> */}
                  <div className="flex items-center gap-2.5">
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
                </div>
              ) : products.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {products.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={key} />
                    ) : (
                      <SingleListItem item={item} key={key} />
                    )
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-1">
                  <p className="text-xl font-medium text-dark">No products found</p>
                  <p className="text-gray-500 mt-2">Try selecting a different category or filter</p>
                </div>
              )}
              {/* <!-- Products Grid Tab Content End --> */}

              {/* <!-- Products Pagination Start --> */}
              {paginationData && paginationData.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-15">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </button>
                  
                  {[...Array(paginationData.pages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`w-10 h-10 rounded-full border transition-colors ${
                        currentPage === index + 1
                          ? "bg-blue border-blue text-white"
                          : "border-gray-300 hover:bg-gray-100 text-dark"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === paginationData.pages}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              )}
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
