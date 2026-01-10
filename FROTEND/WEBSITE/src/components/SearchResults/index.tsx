"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productStyle, setProductStyle] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  useEffect(() => {
    if (!query) {
      router.push("/");
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}&page=${currentPage}&limit=12`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          const productsData = data.data.products || [];
          setProducts(productsData);
          if (data.data.pagination) {
            setPaginationData(data.data.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, router]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="overflow-hidden relative pb-20 pt-[140px] bg-[#f3f4f6]">
        <div className="max-w-full w-full mx-auto px-4 sm:px-8 xl:px-15">
          <div className="w-full">
            {/* Header */}
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
                      Search Results for "{query}"
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
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
                    onClick={() => router.push("/shop")}
                    className="inline-block px-6 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {/* Products Grid/List */}
              {!loading && products.length > 0 && (
                <>
                  <div className="mb-6 text-sm text-dark">
                    Showing {products.length} results {paginationData && `(Page ${paginationData.page} of ${paginationData.pages})`}
                  </div>
                  
                  {productStyle === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                      {products.map((item: any) => {
                        const product = item.product || item;
                        return (
                          <SingleGridItem key={product?.productId || product?.id} item={{ product, sellerCount: item.sellerCount }} />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {products.map((item: any) => {
                        const product = item.product || item;
                        return (
                          <SingleListItem key={product?.productId || product?.id} item={{ product, sellerCount: item.sellerCount }} />
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {!loading && products.length > 0 && paginationData && paginationData.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-3 text-dark hover:bg-blue hover:border-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {"<"}
                  </button>

                  {Array.from({ length: paginationData.pages }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 3), Math.min(paginationData.pages, currentPage + 2))
                    .map((page: number) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                          currentPage === page
                            ? "bg-blue border-blue text-white"
                            : "border-gray-3 text-dark hover:bg-blue hover:border-blue hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    onClick={() => handlePageChange(Math.min(paginationData.pages, currentPage + 1))}
                    disabled={currentPage === paginationData.pages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-3 text-dark hover:bg-blue hover:border-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {">"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SearchResults;
