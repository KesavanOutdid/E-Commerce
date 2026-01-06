"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css/navigation";
import "swiper/css";
import { Category } from "@/types/category";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";

interface SingleItemProps {
  item: Category;
  isActive: boolean;
  onToggle: (isOpen: boolean) => void;
}

const SingleItem = ({ item, isActive, onToggle }: SingleItemProps) => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      console.log(`SingleItem ${item.title} is now ACTIVE`);
    }
  }, [isActive, item.title]);

  const fetchSubcategories = async () => {
    if (subcategories.length > 0) return;
    setLoading(true);
    try {
      console.log(`Fetching subcategories for: ${item.title} (ID: ${item.id})`);
      const response = await fetch(API_ENDPOINTS.SUBCATEGORIES(item.id.toString()));
      const data = await response.json();
      console.log("Subcategory API Response:", data);
      
      if (data.success) {
        let subData = [];
        // Try all known patterns for subcategories
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
          // Look for any array inside data.data (e.g. data.data.items, data.data.list)
          const firstArrayKey = Object.keys(data.data).find(key => Array.isArray(data.data[key]));
          if (firstArrayKey) subData = data.data[firstArrayKey];
        }
        
        console.log(`Extracted ${subData.length} subcategories for ${item.title}`);
        setSubcategories(subData);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Category clicked:", item.title, "Current isActive:", isActive);
    
    if (!isActive) {
      fetchSubcategories();
      onToggle(true);
    } else {
      onToggle(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isActive) {
          console.log("Clicked outside, closing:", item.title);
          onToggle(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isActive, onToggle, item.title]);

  return (
    <div className="relative group flex flex-col items-center z-[50]" ref={dropdownRef}>
      <div 
        onClick={handleClick}
        onMouseEnter={() => !isActive && fetchSubcategories()}
        className="flex flex-col items-center cursor-pointer w-full px-2 group"
      >
        <div className="w-16 h-16 bg-[#F2F3F8] rounded-full flex items-center justify-center mb-1 transition-all duration-300 group-hover:bg-blue/5 shadow-sm border border-transparent group-hover:border-blue/10">
          <Image src={item.img} alt={item.title} width={40} height={40} className="object-contain transition-transform group-hover:scale-110" />
        </div>
        <h2 className={`text-[13px] font-medium text-center transition-colors whitespace-nowrap ${isActive ? 'text-blue' : 'text-dark group-hover:text-blue'}`}>
          {item.title}
        </h2>
      </div>

      {/* Dropdown */}
      {isActive && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[99999] border border-gray-100 py-1.5 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue border-t-transparent animate-spin rounded-full"></div>
              Loading...
            </div>
          ) : subcategories.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.subCategoryId}
                    href={`/shop?subcategory=${sub.subCategoryId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(false);
                    }}
                    className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-blue hover:text-white transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 text-xs text-gray-500 text-center italic">No subcategories</div>
          )}
        </div>
      )}
    </div>
  );
};

const CategorySliderNavigation = () => {
  const sliderRef = useRef<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        const data = await response.json();
        
        if (data.success && data.data.categories) {
          const transformedCategories = data.data.categories.map(
            (category: any) => ({
              id: category.categoryId,
              title: category.name,
              img: category.image 
                ? `${API_BASE_URL}${category.image}` 
                : "/images/categories/placeholder.png",
            })
          );
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="relative flex items-center w-full group py-1">
      <button 
        onClick={handlePrev}
        className="flex-shrink-0 z-10 bg-white/80 p-1 rounded-full shadow-sm mr-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white"
        disabled={loading || categories.length === 0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="flex-grow px-1">
        <Swiper
          ref={sliderRef}
          slidesPerView={"auto"}
          spaceBetween={12}
          centerInsufficientSlides={true}
          className="!overflow-visible"
        >
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <SwiperSlide key={i} style={{ width: 'auto' }}>
                <div className="animate-pulse flex flex-col items-center w-[85px]">
                  <div className="w-16 h-16 bg-gray-2 rounded-full mb-1"></div>
                  <div className="w-12 h-2.5 bg-gray-2 rounded"></div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            categories.map((item) => (
              <SwiperSlide 
                key={item.id} 
                style={{ width: 'auto' }} 
                className={`!overflow-visible ${activeCategoryId === item.id.toString() ? 'z-[1000]' : 'z-[1]'}`}
              >
                <div className="w-fit min-w-[85px] !overflow-visible">
                  <SingleItem 
                    item={item} 
                    isActive={activeCategoryId === item.id.toString()}
                    onToggle={(isOpen) => setActiveCategoryId(isOpen ? item.id.toString() : null)}
                  />
                </div>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>

      <button 
        onClick={handleNext}
        className="flex-shrink-0 z-10 bg-white/80 p-1 rounded-full shadow-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white"
        disabled={loading || categories.length === 0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default CategorySliderNavigation;
