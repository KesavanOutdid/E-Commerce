// import { Category } from "@/types/category";
// import React, { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import { API_ENDPOINTS } from "@/lib/api";
// import Link from "next/link";

// interface SingleItemProps {
//   item: Category;
//   isActive: boolean;
//   onToggle: (isOpen: boolean) => void;
// }

// const SingleItem = ({ item, isActive, onToggle }: SingleItemProps) => {
//   const [subcategories, setSubcategories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const fetchSubcategories = async () => {
//     if (subcategories.length > 0) return;
//     setLoading(true);
//     try {
//       const response = await fetch(API_ENDPOINTS.SUBCATEGORIES(item.id.toString()));
//       const data = await response.json();
//       if (data.success) {
//         // Check if data.data is an array or if it's nested under subcategories
//         const subData = Array.isArray(data.data) ? data.data : data.data.subcategories || [];
//         setSubcategories(subData);
//       }
//     } catch (error) {
//       console.error("Failed to fetch subcategories:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (!isActive) {
//       fetchSubcategories();
//     }
//     onToggle(!isActive);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         if (isActive) onToggle(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isActive, onToggle]);

//   return (
//     <div className="relative group flex flex-col items-center" ref={dropdownRef}>
//       <button 
//         onClick={handleClick}
//         className="flex flex-col items-center focus:outline-none w-full px-2"
//       >
//         <div className="max-w-[100px] w-full bg-[#F2F3F8] h-25 rounded-full flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-gray-2">
//           <Image src={item.img} alt={item.title} width={75} height={59} className="object-contain" />
//         </div>

//         <div className="flex items-center justify-center w-full">
//           <h3 className="inline-block text-base font-medium text-center text-dark truncate max-w-[110px] bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
//             {item.title}
//           </h3>
//           <svg
//             className={`ml-0.5 w-3 h-3 flex-shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//           </svg>
//         </div>
//       </button>

//       {/* Dropdown */}
//       {isActive && (
//         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl z-[9999] border border-gray-3 py-2 overflow-hidden animate-fade-in">
//           {loading ? (
//             <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
//           ) : subcategories.length > 0 ? (
//             <div className="flex flex-col">
//               {subcategories.map((sub) => (
//                 <Link
//                   key={sub.subCategoryId}
//                   href={`/shop-with-sidebar?subcategory=${sub.subCategoryId}`}
//                   className="px-4 py-2.5 text-sm text-dark hover:bg-gray-2 hover:text-blue transition-colors duration-200"
//                 >
//                   {sub.name}
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <div className="px-4 py-2 text-sm text-gray-500">No subcategories</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SingleItem;
