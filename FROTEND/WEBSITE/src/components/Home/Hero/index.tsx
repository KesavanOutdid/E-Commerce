import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-24 sm:pt-32 lg:pt-20 xl:pt-36 bg-[#E5EAF4]">
      <div className="max-w-[1370px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col gap-5">
          <div className="w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={1170}
                height={480}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="relative rounded-[10px] bg-white p-4 sm:p-5 overflow-hidden min-h-[210px] flex items-center">
                <div className="relative z-10">
                  <h2 className="max-w-[153px] font-semibold text-dark text-lg mb-2">
                    <a href="#"> iPhone 14 Plus & 14 Pro Max </a>
                  </h2>

                  <div>
                    <p className="font-medium text-dark-4 text-custom-sm mb-1">
                      limited time offer
                    </p>
                    <span className="flex items-center gap-3">
                      <span className="font-medium text-xl text-red">
                        ₹699
                      </span>
                      <span className="font-medium text-lg text-dark-4 line-through">
                        ₹999
                      </span>
                    </span>
                  </div>
                </div>

                <div className="absolute right-2 bottom-0">
                  <Image
                    src="/images/hero/hero-02.png"
                    alt="mobile image"
                    width={100}
                    height={130}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="relative rounded-[10px] bg-white p-4 sm:p-5 overflow-hidden min-h-[210px] flex items-center">
                <div className="relative z-10">
                  <h2 className="max-w-[153px] font-semibold text-dark text-lg mb-2">
                    <a href="#"> Wireless Headphone </a>
                  </h2>

                  <div>
                    <p className="font-medium text-dark-4 text-custom-sm mb-1">
                      limited time offer
                    </p>
                    <span className="flex items-center gap-3">
                      <span className="font-medium text-xl text-red">
                        ₹699
                      </span>
                      <span className="font-medium text-lg text-dark-4 line-through">
                        ₹999
                      </span>
                    </span>
                  </div>
                </div>

                <div className="absolute right-2 bottom-0">
                  <Image
                    src="/images/hero/hero-01.png"
                    alt="mobile image"
                    width={100}
                    height={130}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="relative rounded-[10px] bg-white p-4 sm:p-5 overflow-hidden min-h-[210px] flex items-center">
                <div className="relative z-10">
                  <h2 className="max-w-[153px] font-semibold text-dark text-lg mb-2">
                    <a href="#"> Smart Watch Series 7 </a>
                  </h2>

                  <div>
                    <p className="font-medium text-dark-4 text-custom-sm mb-1">
                      limited time offer
                    </p>
                    <span className="flex items-center gap-3">
                      <span className="font-medium text-xl text-red">
                        ₹499
                      </span>
                      <span className="font-medium text-lg text-dark-4 line-through">
                        ₹799
                      </span>
                    </span>
                  </div>
                </div>

                <div className="absolute right-2 bottom-0">
                  <Image
                    src="/images/hero/hero-03.png"
                    alt="mobile image"
                    width={100}
                    height={130}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
