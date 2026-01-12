"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SingleListItem from "../Shop/SingleListItem";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import FilterSidebar from "../ShopWithSidebar/FilterSidebar";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  // Filter States
  const [filterMetaData, setFilterMetaData] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    brands: [],
    attributes: {},
    rating: null,
    minPrice: null,
    maxPrice: null
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: any) => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const totalPages = paginationData?.pages || paginationData?.totalPages || 0;
        if (currentPage < totalPages) {
          setCurrentPage(prevPage => prevPage + 1);
        }
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, paginationData, currentPage]);

  // Fetch Metadata
  useEffect(() => {
    if (!query) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCT_FILTERS}?search=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setFilterMetaData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch filter metadata:", error);
      }
    };

    fetchMetadata();
  }, [query]);

  const fetchSearchResults = useCallback(async (isInitial = false) => {
    if (!query) return;
    if (isInitial) setLoading(true);
    else setFetchingMore(true);

    try {
      let url = `${API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}&page=${currentPage}&limit=12`;
      
      // Append filters
      if (selectedFilters.brands?.length > 0) {
        url += `&brands=${selectedFilters.brands.join(',')}`;
      }
      if (selectedFilters.minPrice !== null) {
        url += `&minPrice=${selectedFilters.minPrice}`;
      }
      if (selectedFilters.maxPrice !== null) {
        url += `&maxPrice=${selectedFilters.maxPrice}`;
      }
      if (selectedFilters.rating) {
        url += `&rating=${selectedFilters.rating}`;
      }
      
      // Attributes
      Object.entries(selectedFilters.attributes || {}).forEach(([key, values]: [string, any]) => {
        if (values.length > 0) {
          url += `&${key}=${values.join(',')}`;
        }
      });

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const productsData = data.data.products || [];
        if (currentPage === 1) {
          setProducts(productsData);
        } else {
          setProducts(prev => [...prev, ...productsData]);
        }
        
        if (data.data.pagination) {
          setPaginationData(data.data.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [query, currentPage, selectedFilters]);

  useEffect(() => {
    if (!query) {
      router.push("/");
      return;
    }
    fetchSearchResults(currentPage === 1);
  }, [query, currentPage, selectedFilters, router, fetchSearchResults]);

  // Reset products when query or filters change
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
  }, [query, selectedFilters]);

  return (
    <>
      <section className="overflow-hidden relative pb-20 pt-[140px] bg-[#f3f4f6]">
        <div className="max-w-full w-full mx-auto px-4 sm:px-8 xl:px-15">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
              <FilterSidebar 
                metaData={filterMetaData}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                onApplyFilters={() => setCurrentPage(1)}
              />
            </aside>

            <div className="flex-1 lg:h-[calc(100vh-160px)] lg:overflow-y-auto custom-scrollbar lg:pr-4">
              {/* Header */}
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6 sticky top-0 z-10">
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
                      Search Results for "{query}"
                      {paginationData?.totalItems > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({paginationData.totalItems} products)
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue border-t-transparent animate-spin rounded-full"></div>
                </div>
              )}

              {/* No Results */}
              {!loading && products.length === 0 && (
                <div className="rounded-lg bg-white shadow-1 p-10 text-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-300 mb-4">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <h3 className="text-lg font-semibold text-dark mb-2">No products found</h3>
                  <p className="text-dark mb-6">
                    We couldn't find any products matching "{query}". Try different keywords or browse by category.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFilters({ brands: [], attributes: {}, rating: null, minPrice: null, maxPrice: null });
                      router.push("/shop");
                    }}
                    className="inline-block px-6 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {/* Products List */}
              {!loading && products.length > 0 && (
                <>
                  <div className="space-y-4">
                    {products.map((item: any, key: number) => {
                      const product = item.product || item;
                      const isLastElement = products.length === key + 1;
                      return (
                        <div key={product?.productId || product?.id || key} ref={isLastElement ? lastProductElementRef : null}>
                          <SingleListItem item={{ product, sellerCount: item.sellerCount }} />
                        </div>
                      );
                    })}
                  </div>

                  {fetchingMore && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue"></div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SearchResults;
