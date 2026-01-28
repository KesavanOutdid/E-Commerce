"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-10 sm:pt-0 flex-col-reverse sm:flex-row justify-between">
          <div className="max-w-[540px] py-8 sm:py-10 lg:py-12 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-5 sm:mb-8">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-4xl mb-4 leading-tight">
              <a href="#">iPhone 14 Plus & 14 Pro Max</a>
            </h1>

            <p className="text-dark-4 text-lg">
              Get the latest iPhone with improved battery life, camera systems, and the fastest chip in a smartphone.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-8"
            >
              Shop Now
            </a>
          </div>

          <div className="pr-4 sm:pr-7.5 lg:pr-12.5 flex-shrink-0">
            <Image
              src="/images/hero/iphone14.jpg"
              alt="iphone"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row justify-between">
          <div className="max-w-[540px] py-8 sm:py-10 lg:py-12 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-5 sm:mb-8">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                30%
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Sale
                <br />
                Off
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-4xl mb-4 leading-tight">
              <a href="#">Premium Quality Tech Gadgets</a>
            </h1>

            <p className="text-dark-4 text-lg">
            Discover our collection of premium gadgets designed to enhance your digital lifestyle and productivity.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-8"
            >
              Shop Now
            </a>
          </div>

          <div className="pr-4 sm:pr-7.5 lg:pr-12.5 flex-shrink-0">
            <Image
              src="/images/hero/hero-01.png"
              alt="headset"
              width={320}
              height={160}
              className="object-contain"
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
