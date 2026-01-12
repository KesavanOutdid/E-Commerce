"use client";
import React, { useState, useEffect } from "react";

interface FilterMetaData {
  brands: string[];
  priceRange: { min: number; max: number };
  attributes: Record<string, string[]>;
  ratings: number[];
  subCategories: { id: string; name: string }[];
}

interface FilterSidebarProps {
  metaData: FilterMetaData | null;
  selectedFilters: any;
  setSelectedFilters: (filters: any) => void;
  onApplyFilters: () => void;
}

const FilterSidebar = ({ metaData, selectedFilters, setSelectedFilters, onApplyFilters }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState({
    min: selectedFilters.minPrice || 0,
    max: selectedFilters.maxPrice || 100000
  });

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brands: true,
    price: true,
    categories: true,
    ratings: true
  });
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (metaData) {
      setPriceRange({
        min: selectedFilters.minPrice || metaData.priceRange.min,
        max: selectedFilters.maxPrice || metaData.priceRange.max
      });
      
      // Initialize dynamic sections to be open by default
      const initialOpen: Record<string, boolean> = { ...openSections };
      Object.keys(metaData.attributes).forEach(key => {
        if (initialOpen[key] === undefined) initialOpen[key] = true;
      });
      setOpenSections(initialOpen);
    }
  }, [metaData, selectedFilters.minPrice, selectedFilters.maxPrice]);

  const handleBrandChange = (brand: string) => {
    const currentBrands = [...(selectedFilters.brands || [])];
    const index = currentBrands.indexOf(brand);
    if (index === -1) {
      currentBrands.push(brand);
    } else {
      currentBrands.splice(index, 1);
    }
    setSelectedFilters({ ...selectedFilters, brands: currentBrands });
  };

  const handleAttributeChange = (attrName: string, value: string) => {
    const currentAttrs = { ...(selectedFilters.attributes || {}) };
    const currentValues = [...(currentAttrs[attrName] || [])];
    const index = currentValues.indexOf(value);
    if (index === -1) {
      currentValues.push(value);
    } else {
      currentValues.splice(index, 1);
    }
    if (currentValues.length === 0) {
      delete currentAttrs[attrName];
    } else {
      currentAttrs[attrName] = currentValues;
    }
    setSelectedFilters({ ...selectedFilters, attributes: currentAttrs });
  };

  const handleRatingChange = (rating: number) => {
    setSelectedFilters({ ...selectedFilters, rating: selectedFilters.rating === rating ? null : rating });
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!metaData) {
    return (
      <div className="bg-white w-full max-w-[380px] shadow-[0_2px_4px_0_rgba(0,0,0,0.08)]">
        <div className="h-14 border-b border-[#f0f0f0] flex items-center px-4">
          <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-50 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-50 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasFilters = (selectedFilters.brands?.length > 0) || 
                     (selectedFilters.rating) || 
                     (selectedFilters.minPrice !== null && selectedFilters.minPrice !== metaData.priceRange.min) || 
                     (selectedFilters.maxPrice !== null && selectedFilters.maxPrice !== metaData.priceRange.max) || 
                     (Object.keys(selectedFilters.attributes || {}).length > 0);

  return (
    <div className="bg-white sticky top-[140px] w-full max-w-[380px] select-none shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#f0f0f0] flex justify-between items-center bg-white z-10">
        <h2 className="text-[18px] font-medium text-black tracking-tight">Filters</h2>
        {hasFilters && (
          <button 
            onClick={() => setSelectedFilters({ brands: [], attributes: {}, rating: null, minPrice: null, maxPrice: null })}
            className="text-[12px] font-bold text-[#2874f0] hover:text-blue-700 uppercase"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar bg-white">
        {/* Active Filters Chips */}
        {hasFilters && (
          <div className="px-3 py-3 border-b border-[#f0f0f0] flex flex-wrap gap-1.5">
            {selectedFilters.brands?.map((brand: string) => (
              <div key={brand} className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 text-[12px] text-gray-700 rounded-sm group hover:bg-gray-200 transition-colors border border-gray-200">
                <button onClick={() => handleBrandChange(brand)} className="text-gray-400 group-hover:text-red-500">✕</button>
                <span className="max-w-[100px] truncate">{brand}</span>
              </div>
            ))}
            {Object.entries(selectedFilters.attributes || {}).map(([key, values]: [string, any]) => 
              values.map((val: string) => (
                <div key={`${key}-${val}`} className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 text-[12px] text-gray-700 rounded-sm group hover:bg-gray-200 transition-colors border border-gray-200">
                  <button onClick={() => handleAttributeChange(key, val)} className="text-gray-400 group-hover:text-red-500">✕</button>
                  <span className="max-w-[100px] truncate">{val}</span>
                </div>
              ))
            )}
            {selectedFilters.rating && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 text-[12px] text-gray-700 rounded-sm group hover:bg-gray-200 transition-colors border border-gray-200">
                <button onClick={() => handleRatingChange(selectedFilters.rating)} className="text-gray-400 group-hover:text-red-500">✕</button>
                <span>{selectedFilters.rating}★ & above</span>
              </div>
            )}
          </div>
        )}

        {/* Categories Section */}
        <div className="border-b border-[#f0f0f0]">
          <div 
            onClick={() => toggleSection('categories')}
            className="px-4 py-3 flex justify-between items-center cursor-pointer group"
          >
            <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">Categories</h3>
            <span className={`text-[10px] text-gray-400 transition-transform ${openSections.categories ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {openSections.categories && (
            <div className="px-4 pb-4 space-y-2 pl-2">
              <div className="text-[13px] text-gray-500 flex items-center gap-2 cursor-pointer hover:text-[#2874f0]">
                <span className="text-[10px] text-gray-400">❮</span>
                <span className="line-clamp-1">All Products</span>
              </div>
              {metaData.subCategories?.map((sub) => (
                <div key={sub.id} className="text-[14px] font-medium text-gray-700 hover:text-[#2874f0] cursor-pointer flex items-center gap-2 pl-4 transition-colors">
                  <span className="line-clamp-1">{sub.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="border-b border-[#f0f0f0]">
          <div 
            onClick={() => toggleSection('price')}
            className="px-4 py-3 flex justify-between items-center cursor-pointer group"
          >
            <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">Price</h3>
            <span className={`text-[10px] text-gray-400 transition-transform ${openSections.price ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {openSections.price && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 relative">
                  <select 
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                    className="w-full text-[13px] border border-gray-300 rounded-sm px-2 py-1.5 focus:outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value={metaData.priceRange.min}>Min</option>
                    {[500, 1000, 2000, 5000, 10000, 20000, 50000].map(p => (
                      p >= metaData.priceRange.min && p < priceRange.max && <option key={p} value={p}>₹{p}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-400 font-bold">▼</div>
                </div>
                <span className="text-gray-400 text-[13px] font-medium px-1">to</span>
                <div className="flex-1 relative">
                  <select 
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full text-[13px] border border-gray-300 rounded-sm px-2 py-1.5 focus:outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value={metaData.priceRange.max}>Max</option>
                    {[1000, 2000, 5000, 10000, 20000, 50000, 100000].map(p => (
                      p <= metaData.priceRange.max && p > priceRange.min && <option key={p} value={p}>₹{p}+</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-400 font-bold">▼</div>
                </div>
                <button 
                  onClick={() => setSelectedFilters({ ...selectedFilters, minPrice: priceRange.min, maxPrice: priceRange.max })}
                  className="p-1.5 bg-[#2874f0] text-white rounded-sm hover:bg-blue-700 transition-colors"
                  title="Apply Price"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Brand Section */}
        {metaData.brands.length > 0 && (
          <div className="border-b border-[#f0f0f0]">
            <div 
              onClick={() => toggleSection('brands')}
              className="px-4 py-3 flex justify-between items-center cursor-pointer group"
            >
              <h3 className="text-[13px] font-medium font-bold text-black uppercase tracking-wider">Brand</h3>
              <span className={`text-[10px] text-gray-400 transition-transform ${openSections.brands ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {openSections.brands && (
              <div className="px-4 pb-4">
                {metaData.brands.length > 8 && (
                  <div className="mb-3 relative">
                    <input 
                      type="text" 
                      placeholder="Search Brand" 
                      className="w-full text-[13px] border-b border-gray-200 pb-1 focus:outline-none focus:border-[#2874f0] pl-5 placeholder:text-gray-400"
                      onChange={(e) => setSearchQueries({ ...searchQueries, brands: e.target.value })}
                    />
                    <svg className="absolute left-0 top-0.5 text-gray-300" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                )}
                <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {metaData.brands
                    .filter(b => !searchQueries.brands || b.toLowerCase().includes(searchQueries.brands.toLowerCase()))
                    .slice(0, showMore.brands ? undefined : 6)
                    .map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={(selectedFilters.brands || []).includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="peer appearance-none w-[14px] h-[14px] border border-gray-300 rounded-[2px] checked:bg-[#2874f0] checked:border-[#2874f0] transition-all cursor-pointer"
                          />
                          <svg className="absolute left-0.5 top-0.5 w-[10px] h-[10px] text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-[14px] text-gray-700 group-hover:text-black line-clamp-1">{brand}</span>
                      </label>
                    ))}
                </div>
                {metaData.brands.length > 6 && (
                  <button 
                    onClick={() => setShowMore(p => ({ ...p, brands: !p.brands }))}
                    className="mt-3 text-[12px] font-bold text-[#2874f0] uppercase"
                  >
                    {showMore.brands ? "Show Less" : `${metaData.brands.length - 6} MORE`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Attributes */}
        {Object.entries(metaData.attributes).map(([attrName, values]) => (
          <div key={attrName} className="border-b border-[#f0f0f0]">
            <div 
              onClick={() => toggleSection(attrName)}
              className="px-4 py-3 flex justify-between items-center cursor-pointer group"
            >
              <h3 className="text-[13px] font-medium  text-black uppercase tracking-wider">{attrName}</h3>
              <span className={`text-[10px] text-gray-400 transition-transform ${openSections[attrName] ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {openSections[attrName] && (
              <div className="px-4 pb-4">
                {values.length > 8 && (
                  <div className="mb-3 relative">
                    <input 
                      type="text" 
                      placeholder={`Search ${attrName}`} 
                      className="w-full text-[13px] border-b border-gray-200 pb-1 focus:outline-none focus:border-[#2874f0] pl-5 placeholder:text-gray-400"
                      onChange={(e) => setSearchQueries({ ...searchQueries, [attrName]: e.target.value })}
                    />
                    <svg className="absolute left-0 top-0.5 text-gray-300" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                )}
                <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {values
                    .filter(v => !searchQueries[attrName] || v.toLowerCase().includes(searchQueries[attrName].toLowerCase()))
                    .slice(0, showMore[attrName] ? undefined : 6)
                    .map((val) => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={(selectedFilters.attributes?.[attrName] || []).includes(val)}
                            onChange={() => handleAttributeChange(attrName, val)}
                            className="peer appearance-none w-[14px] h-[14px] border border-gray-300 rounded-[2px] checked:bg-[#2874f0] checked:border-[#2874f0] transition-all cursor-pointer"
                          />
                          <svg className="absolute left-0.5 top-0.5 w-[10px] h-[10px] text-white hidden peer-checked:block pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-[14px] text-gray-700 group-hover:text-black line-clamp-1">{val}</span>
                      </label>
                    ))}
                </div>
                {values.length > 6 && (
                  <button 
                    onClick={() => setShowMore(p => ({ ...p, [attrName]: !p[attrName] }))}
                    className="mt-3 text-[12px] font-bold text-[#2874f0] uppercase"
                  >
                    {showMore[attrName] ? "Show Less" : `${values.length - 6} MORE`}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Ratings Section */}
        <div className="">
          <div 
            onClick={() => toggleSection('ratings')}
            className="px-4 py-3 flex justify-between items-center cursor-pointer group"
          >
            <h3 className="text-[13px] font-medium text-black uppercase tracking-wider">Ratings</h3>
            <span className={`text-[10px] text-gray-400 transition-transform ${openSections.ratings ? 'rotate-180' : ''}`}>▼</span>
          </div>
          {openSections.ratings && (
            <div className="px-4 pb-4 space-y-3">
              {[4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFilters.rating === star}
                    onChange={() => handleRatingChange(star)}
                    className="w-[14px] h-[14px] border-gray-300 text-[#2874f0] focus:ring-0 rounded-full cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] text-gray-700 group-hover:text-black">{star}★ & above</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
      `}</style>
    </div>
  );
};

export default FilterSidebar;
