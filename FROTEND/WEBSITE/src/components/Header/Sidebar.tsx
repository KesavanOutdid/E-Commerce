"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";
import { Category } from "@/types/category";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryItem = ({ cat, onClose }: { cat: Category; onClose: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);

  const toggleExpand = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Toggling category:", cat.title, "ID:", cat.id);
    if (!isExpanded && subcategories.length === 0) {
      setLoadingSub(true);
      try {
        const url = API_ENDPOINTS.SUBCATEGORIES(cat.id.toString());
        console.log("Fetching subcategories from:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Subcategory data received:", data);
        if (data.success) {
          // Robustly handle different data structures
          let subData = [];
          if (Array.isArray(data.data)) {
            subData = data.data;
          } else if (data.data && Array.isArray(data.data.subcategories)) {
            subData = data.data.subcategories;
          } else if (data.subcategories && Array.isArray(data.subcategories)) {
            subData = data.subcategories;
          }
          console.log("Extracted subData:", subData);
          setSubcategories(subData);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      } finally {
        setLoadingSub(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <li className="last:border-0">
      <button
        onClick={toggleExpand}
        className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 group transition-colors"
      >
        <div className="w-8 h-8 relative flex-shrink-0 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <Image 
            src={cat.img} 
            alt={cat.title} 
            fill 
            className="object-contain p-1"
          />
        </div>
        <span className="flex-grow text-left font-medium">{cat.title}</span>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" 
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="bg-gray-50/50">
          {loadingSub ? (
            <div className="px-16 py-2 text-xs text-gray-400 italic">Loading...</div>
          ) : subcategories.length > 0 ? (
            <ul className="py-1">
              {subcategories.map((sub) => (
                <li key={sub.subCategoryId}>
                  <Link
                    href={`/shop?subcategory=${sub.subCategoryId}`}
                    onClick={onClose}
                    className="flex items-center px-16 py-2 text-[13px] text-gray-600 hover:text-blue hover:bg-gray-100 transition-colors"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-16 py-2 text-xs text-gray-400">No subcategories found</div>
          )}
        </div>
      )}
    </li>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[99999] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[350px] bg-white z-[100000] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* User Greeting - Changed to bg-blue */}
        <div className="bg-blue text-white p-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <span className="font-bold text-lg">
            Hello, {isAuthenticated ? user?.firstName : "Sign In"}
          </span>
          <button 
            onClick={onClose}
            className="ml-auto text-white hover:rotate-90 transition-transform duration-200"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="py-4">
            <h3 className="px-6 text-[17px] font-medium text-dark mb-2 tracking-tight">Trending</h3>
            <ul className="space-y-1 mb-4">
              <li><Link href="/#best-selling-products" className="px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 block" onClick={onClose}>Best Selling Products</Link></li>
            </ul>

            <hr className="border-gray-200 mb-4" />

            <h3 className="px-6 text-[17px] font-medium text-dark mb-2 tracking-tight">Shop By Category</h3>
            {loading ? (
              <div className="px-6 space-y-4 py-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 animate-pulse rounded-full flex-shrink-0"></div>
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mb-4">
                {categories.map((cat) => (
                  <CategoryItem key={cat.id} cat={cat} onClose={onClose} />
                ))}
              </ul>
            )}

            <hr className="border-gray-200 mb-4" />

            <h3 className="px-6 text-[17px] font-medium text-dark mb-2 tracking-tight">Help & Settings</h3>
            <ul className="space-y-1 mb-6">
              <li><Link href="/my-account" className="px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 block" onClick={onClose}>Your Account</Link></li>
              {!isAuthenticated ? (
                <li><Link href="/signin" className="px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 block" onClick={onClose}>Sign In</Link></li>
              ) : (
                <li><button onClick={handleLogout} className="w-full text-left px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 block font-medium text-red-600 hover:text-red-700">Sign Out</button></li>
              )}
              <li><Link href="/contact" className="px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-100 block" onClick={onClose}>Customer Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
