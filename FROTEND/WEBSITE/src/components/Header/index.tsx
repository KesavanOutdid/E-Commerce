"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { removeAllItemsFromCart, selectTotalPrice } from "@/redux/features/cart-slice";
import { logout } from "@/redux/features/auth-slice";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";
import { Category } from "@/types/category";

import { removeAllItemsFromWishlist, setWishlist } from "@/redux/features/wishlist-slice";

const CategoryItem = ({ cat }: { cat: Category }) => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (hasFetched || loading) return;
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SUBCATEGORIES(cat.id.toString()));
      const data = await response.json();
      if (data.success) {
        let subData = [];
        if (Array.isArray(data.data)) {
          subData = data.data;
        } else if (data.data && Array.isArray(data.data.subcategories)) {
          subData = data.data.subcategories;
        } else if (data.data && Array.isArray(data.data.subcategory)) {
          subData = data.data.subcategory;
        } else if (data.subcategories && Array.isArray(data.subcategories)) {
          subData = data.subcategories;
        } else if (data.subcategory && Array.isArray(data.subcategory)) {
          subData = data.subcategory;
        } else if (data.data && typeof data.data === 'object') {
          const firstArrayKey = Object.keys(data.data).find(key => Array.isArray(data.data[key]));
          if (firstArrayKey) subData = data.data[firstArrayKey];
        }
        setSubcategories(subData);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    fetchData();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fetchData();
    setIsOpen(!isOpen);
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative group h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div 
        className="flex items-center gap-2 px-3 h-full hover:bg-gray-100 transition-all text-dark whitespace-nowrap border-b-2 border-transparent hover:border-blue cursor-pointer"
        onClick={handleClick}
      >
        <div className="w-9 h-9 relative flex-shrink-0 transition-transform group-hover:scale-110">
          <Image 
            src={cat.img} 
            alt={cat.title} 
            fill 
            className="object-contain"
          />
        </div>
        <span className="text-[16px] font-small tracking-tight">{cat.title}</span>
        <svg 
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
          className={`mt-0.5 opacity-40 transition-transform ${isOpen ? 'rotate-180' : 'group-hover:rotate-180'}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Subcategory Dropdown */}
      <div className={`absolute top-full left-0 pt-0.5 transition-all duration-200 z-[10000] ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'}`}>
        <div className="bg-white shadow-xl rounded-sm py-1.5 min-w-[200px]">
          {loading ? (
            <div className="px-4 py-2.5 text-xs text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue border-t-transparent animate-spin rounded-full"></div>
              Loading...
            </div>
          ) : subcategories.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <ul className="flex flex-col">
                {subcategories.map((sub) => (
                  <li key={sub.subCategoryId}>
                    <Link
                      href={`/shop?subcategory=${sub.subCategoryId}`}
                      className="block px-4 py-2 text-[13px] text-gray-200  hover:text-blue transition-colors font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : hasFetched ? (
            <div className="px-4 py-2.5 text-xs text-gray-500">No categories available</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, accessToken } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const product = useAppSelector((state) => state.cartReducer.items);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(removeAllItemsFromCart());
    dispatch(removeAllItemsFromWishlist());
    router.push("/signin");
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  const fetchSearchSuggestions = async (query: string) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      fetchSearchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (product: any) => {
    setShowSuggestions(false);
    setSearchQuery("");
    router.push(`/shop-details/${product.productId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        const data = await response.json();
        if (data.success && data.data.categories) {
          const transformedCategories = data.data.categories.map((category: any) => ({
            id: category.categoryId,
            title: category.name,
            img: category.image ? `${API_BASE_URL}${category.image}` : "/images/categories/placeholder.png",
          }));
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    const fetchWishlist = async () => {
      if (!isAuthenticated || !accessToken) return;
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
            title: product.productName,
            price: product.price,
            discountedPrice: product.salePrice,
            quantity: 1,
            status: product.stock > 0 ? "In Stock" : "Out of Stock",
            imgs: {
              thumbnails: product.images.map((img: string) => `${API_BASE_URL}${img}`),
              previews: product.images.map((img: string) => `${API_BASE_URL}${img}`),
            },
          }));
          dispatch(setWishlist(transformedItems));
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    };

    fetchCategories();
    fetchWishlist();

    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, [accessToken, isAuthenticated, dispatch]);

  return (
    <header className={`fixed left-0 top-0 w-full z-[9999] transition-all duration-300 shadow-md`}>
      {/* Top Bar - User requested blue */}
      <div className="bg-blue py-2">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 pt-1 border border-transparent hover:border-white p-1 rounded-sm transition-all">
            <Image
              src="/images/icons/icon-07.svg"
              alt="Logo"
              width={100}
              height={70}
              className="w-auto h-7 brightness-0 invert"
            />
            <span className="text-white text-xl  tracking-tight">Shopix</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-[800px] relative" ref={suggestionsRef}>
            <form className="relative w-full h-10 shadow-sm" onSubmit={handleSearchSubmit}>
              {/* Search Icon */}
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>

              {/* Input */}
              <input
                onChange={handleSearchInput}
                onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                value={searchQuery}
                type="text"
                placeholder="Search items..."
                className="w-full h-full px-4 pr-10 outline-none text-dark text-sm rounded-sm"
                autoComplete="off"
              />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-lg z-[10001] overflow-hidden">
                {suggestionsLoading ? (
                  <div className="px-4 py-6 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue border-t-transparent animate-spin rounded-full"></div>
                    <span className="text-sm text-dark font-medium">Loading suggestions...</span>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions.map((prod: any, index: number) => (
                          <button
                            key={prod.productId}
                            type="button"
                            onClick={() => handleSuggestionClick(prod)}
                            className="w-full text-left px-4 py-3 text-sm text-dark hover:text-blue hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 group"
                          >
                            {prod.image && (
                              <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                <Image
                                  src={`${API_BASE_URL}${prod.image}`}
                                  alt={prod.productName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-dark group-hover:text-blue truncate text-sm transition-colors">{prod.productName}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-gray-400 mb-2">
                          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <p className="text-sm text-dark font-medium">No products found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 text-white">
            <div className="relative group">
              {isAuthenticated ? (
                <div className="hidden lg:flex flex-col border border-transparent hover:border-white p-1 px-2 rounded-sm transition-all cursor-pointer">
                  <span className="text-[12px] leading-tight opacity-90">Hello, {user?.firstName}</span>
                  <span className="text-sm font-bold leading-tight flex items-center gap-1">
                    Account
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </span>
                </div>
              ) : (
                <Link href="/signin" className="hidden lg:flex flex-col border border-transparent hover:border-white p-1 px-2 rounded-sm transition-all">
                  <span className="text-[12px] leading-tight opacity-90">Hello, Sign in</span>
                  <span className="text-sm font-bold leading-tight">Account</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isAuthenticated && (
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
                  <div className="bg-white shadow-xl border border-gray-2 rounded-sm py-2 min-w-[180px]">
                    <Link
                      href="/my-account?tab=account-details"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-gray-1 hover:text-blue transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      href="/view-orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-gray-1 hover:text-blue transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                      </svg>
                      Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-dark hover:bg-gray-1 hover:text-blue transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                        Wishlist
                      </div>
                      {wishlistItems.length > 0 && (
                        <span className="bg-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-gray-2 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red hover:bg-gray-1 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/wishlist"
              className="flex items-end border border-transparent hover:border-white p-1 px-1.5 rounded-sm transition-all relative group"
            >
              <div className="relative">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:scale-105 transition-transform">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-medium mb-0.5 hidden sm:block ml-1">Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-end border border-transparent hover:border-white p-1 px-1.5 rounded-sm transition-all relative group"
            >
              <div className="relative">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:scale-105 transition-transform">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-red text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-sm">
                  {product.length}
                </span>
              </div>
              <span className="text-[13px] font-medium mb-0.5 hidden sm:block ml-1">Cart</span>
            </Link>

            <Link
              href="/contact"
              className="flex items-end border border-transparent hover:border-white p-1 px-1.5 rounded-sm transition-all relative group"
            >
              <div className="relative">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:scale-105 transition-transform">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="text-[13px] font-medium mb-0.5 hidden sm:block ml-1">Contact</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Amazon & Flipkart Mix Design */}
      <div className="bg-white border-t border-gray-200 shadow-sm h-[64px] flex items-center">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-2 h-full w-full">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 h-full px-3 hover:bg-gray-100 transition-all text-dark font-bold flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span className="text-[14px] font-bold tracking-tight">All</span>
          </button>
          
          <div className="flex items-center h-full gap-1 flex-grow">
            {categories.map((cat) => (
              <CategoryItem key={cat.id} cat={cat} />
            ))}
          </div>

          {/* <div className="hidden lg:flex items-center gap-5 h-full text-dark/80 text-[13px] font-semibold ml-4">
             <Link href="/shop" className="h-full flex items-center px-2 hover:text-blue transition-all">New Releases</Link>
             <Link href="/deals" className="h-full flex items-center px-2 hover:text-blue transition-all">Today's Deals</Link>
          </div> */}
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
};

export default Header;
