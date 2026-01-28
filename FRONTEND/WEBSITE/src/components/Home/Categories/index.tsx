// "use client";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { useCallback, useRef, useEffect, useState } from "react";
// import Image from "next/image";

// // Import Swiper styles
// import "swiper/css/navigation";
// import "swiper/css";
// import SingleItem from "./SingleItem";
// import { Category } from "@/types/category";
// import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api";

// const Categories = () => {
//   const sliderRef = useRef(null);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

//   const handlePrev = useCallback(() => {
//     if (!sliderRef.current) return;
//     sliderRef.current.swiper.slidePrev();
//   }, []);

//   const handleNext = useCallback(() => {
//     if (!sliderRef.current) return;
//     sliderRef.current.swiper.slideNext();
//   }, []);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await fetch(API_ENDPOINTS.CATEGORIES);
//         const data = await response.json();
        
//         if (data.success && data.data.categories) {
//           const transformedCategories = data.data.categories.map(
//             (category: any) => ({
//               id: category.categoryId,
//               title: category.name,
//               img: category.image 
//                 ? `${API_BASE_URL}${category.image}` 
//                 : "/images/categories/placeholder.png",
//             })
//           );
//           setCategories(transformedCategories);
//         }
//       } catch (error) {
//         console.error("Failed to fetch categories:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (sliderRef.current) {
//       sliderRef.current.swiper.init();
//     }
//   }, []);

//   return (
//     <section className="pt-17.5 pb-20">
//       <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-8 xl:px-0">
//         <div className="categories-carousel common-carousel relative">
//           <div className="flex items-center justify-end mb-10 gap-3">
//             <button onClick={handlePrev} className="swiper-button-prev relative !left-0 !top-0 !mt-0">
//                 <svg
//                   className="fill-current"
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
//                     fill=""
//                   />
//                 </svg>
//               </button>

//               <button onClick={handleNext} className="swiper-button-next">
//                 <svg
//                   className="fill-current"
//                   width="24"
//                   height="24"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     clipRule="evenodd"
//                     d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
//                     fill=""
//                   />
//                 </svg>
//               </button>
//             </div>

//           <Swiper
//             ref={sliderRef}
//             slidesPerView={6}
//             className="!overflow-visible"
//             breakpoints={{
//               // when window width is >= 640px
//               0: {
//                 slidesPerView: 2,
//               },
//               1000: {
//                 slidesPerView: 4,
//                 // spaceBetween: 4,
//               },
//               // when window width is >= 768px
//               1200: {
//                 slidesPerView: 6,
//               },
//             }}
//           >
//             {loading ? (
//               <SwiperSlide>
//                 <div className="text-center py-8">Loading...</div>
//               </SwiperSlide>
//             ) : (
//               categories.map((item) => (
//                 <SwiperSlide key={item.id}>
//                   <SingleItem 
//                     item={item} 
//                     isActive={activeCategoryId === item.id.toString()}
//                     onToggle={(isOpen) => setActiveCategoryId(isOpen ? item.id.toString() : null)}
//                   />
//                 </SwiperSlide>
//               ))
//             )}
//           </Swiper>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Categories;
