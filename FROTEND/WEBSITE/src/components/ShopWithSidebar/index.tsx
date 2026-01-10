"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CustomSelect from "./CustomSelect";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import FilterSidebar from "./FilterSidebar";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

const ShopWithSidebar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subcategory = searchParams.get("subcategory");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productStyle, setProductStyle] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);
  const [filterMeta, setFilterMeta] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    brands: [],
    attributes: {},
    rating: null,
    minPrice: null,
    maxPrice: null
  });

  // Fetch Filter Metadata
  useEffect(() => {
    const fetchFilterMeta = async () => {
      try {
        let url = `${API_ENDPOINTS.PRODUCT_FILTERS}?`;
        if (categoryId) url += `categoryId=${categoryId}&`;
        if (subcategory) url += `subCategoryId=${subcategory}&`;
        if (search) url += `search=${search}&`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setFilterMeta(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch filter meta:", error);
      }
    };
    fetchFilterMeta();
  }, [subcategory, categoryId, search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let baseUrl = API_ENDPOINTS.PRODUCTS;
      if (search) {
        baseUrl = API_ENDPOINTS.SEARCH_PRODUCTS || `${API_BASE_URL}/api/products/search`;
      } else if (subcategory) {
        baseUrl = API_ENDPOINTS.PRODUCTS_BY_SUBCATEGORY(subcategory);
      }

      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (categoryId) params.append("categoryId", categoryId);
      params.append("page", currentPage.toString());
      params.append("limit", "12");

      // Apply Filters
      if (selectedFilters.brands.length > 0) {
        params.append("brands", selectedFilters.brands.join(","));
      }
      if (selectedFilters.rating) {
        params.append("rating", selectedFilters.rating.toString());
      }
      if (selectedFilters.minPrice) {
        params.append("minPrice", selectedFilters.minPrice.toString());
      }
      if (selectedFilters.maxPrice) {
        params.append("maxPrice", selectedFilters.maxPrice.toString());
      }

      // Add dynamic attributes
      if (selectedFilters.attributes) {
        Object.entries(selectedFilters.attributes).forEach(([key, values]: [string, any]) => {
          if (values.length > 0) {
            params.append(key, values.join(","));
          }
        });
      }

      const separator = baseUrl.includes("?") ? "&" : "?";
      const url = `${baseUrl}${separator}${params.toString()}`;

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
  }, [subcategory, categoryId, search, currentPage, selectedFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="overflow-hidden relative pb-20 pt-[140px] bg-[#f3f4f6]">
        <div className="max-w-full w-full mx-auto px-4 sm:px-8 xl:px-15">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Section */}
            <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
              <FilterSidebar 
                metaData={filterMeta} 
                selectedFilters={selectedFilters} 
                setSelectedFilters={setSelectedFilters}
                onApplyFilters={fetchProducts}
              />
            </aside>

            {/* Content Section */}
            <div className="flex-1">
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
                      {search ? `Search results for: "${search}"` : (subcategory ? `Collection: ${subcategory}` : "Explore Our Products")}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      className={`p-2 rounded ${productStyle === "grid" ? "text-blue bg-blue/10" : "text-gray-500"}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
                    </button>
                    <button
                      onClick={() => setProductStyle("list")}
                      className={`p-2 rounded ${productStyle === "list" ? "text-blue bg-blue/10" : "text-gray-500"}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List/Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div
                    className={`${
                      productStyle === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-7.5 gap-y-9"
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

                  {paginationData && paginationData.pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-15">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-1">
                  <p className="text-xl font-medium text-dark">No products found</p>
                  <p className="text-gray-500 mt-2">Try adjusting your filters to find what you&apos;re looking for</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
