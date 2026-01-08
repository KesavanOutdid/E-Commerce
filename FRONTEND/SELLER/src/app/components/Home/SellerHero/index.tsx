import React from 'react'
import Image from 'next/image'
import withBasePath from '@/utils/basePath'

const SellerHero = () => {
    return (
        <section className='bg-gradient-to-br from-blue-50 to-purple-50 pt-28 pb-20'>
            <div className='container'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
                    <div className='space-y-4 lg:space-y-6'>
                        <div className='space-y-3 lg:space-y-4'>
                            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900'>
                                AtoZ sale <span className='text-5xl sm:text-6xl lg:text-7xl text-primary'>0%</span>
                            </h1>
                            <h2 className='text-3xl sm:text-4xl font-bold text-gray-800'>
                                Commission<span className='text-xs align-super'>*</span>
                            </h2>
                            <p className='text-2xl sm:text-3xl font-semibold text-gray-700'>
                                pe zyada becho full on nacho!
                            </p>
                        </div>
                        
                        <div className='bg-gradient-to-r from-yellow-400 to-orange-400 w-fit px-4 lg:px-6 py-2 lg:py-3 rounded-r-full transform -skew-x-12'>
                            <p className='text-xs sm:text-sm font-bold text-gray-900 skew-x-12'>
                                & BIG DROP IN RETURN FEE
                            </p>
                        </div>

                        <div className='pt-2 lg:pt-4'>
                            <p className='text-xl lg:text-2xl font-bold text-gray-900'>LIVE NOW</p>
                        </div>
                    </div>

                    <div className='relative h-80 lg:h-96'>
                        <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end gap-2 lg:gap-4'>
                            <div className='bg-primary/10 w-20 sm:w-24 lg:w-32 h-32 sm:h-40 lg:h-48 rounded-t-xl'></div>
                            <div className='bg-primary/20 w-20 sm:w-24 lg:w-32 h-40 sm:h-48 lg:h-56 rounded-t-xl'></div>
                            <div className='bg-primary/30 w-20 sm:w-24 lg:w-32 h-48 sm:h-56 lg:h-64 rounded-t-xl'></div>
                        </div>
                        <div className='absolute right-0 top-0 lg:top-10 flex gap-2 lg:gap-4 items-center'>
                            <div className='bg-blue-500 rounded-full w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center overflow-hidden'>
                                <Image 
                                    src={withBasePath('/images/mentor/boy1.svg')} 
                                    alt='Seller' 
                                    width={200} 
                                    height={200}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='bg-yellow-400 rounded-full w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center overflow-hidden'>
                                <Image 
                                    src={withBasePath('/images/mentor/girl1.svg')} 
                                    alt='Seller' 
                                    width={150} 
                                    height={150}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        </div>
                        <div className='absolute -bottom-5 right-5 lg:-bottom-10 lg:right-10 bg-yellow-400 w-12 h-12 lg:w-16 lg:h-16 rounded-lg transform rotate-12 flex items-center justify-center shadow-lg'>
                            <svg className='w-6 h-6 lg:w-8 lg:h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 mt-12 lg:mt-16'>
                    <div className='text-center p-4 bg-white rounded-[20px] hover:bg-[#611f69] transition-all duration-500 transform hover:scale-105 hover:shadow-xl group'>
                        <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-white transition-colors duration-500'>14 Lakh+</h3>
                        <p className='text-gray-600 mt-2 text-sm lg:text-base group-hover:text-white transition-colors duration-500'>Seller community</p>
                    </div>
                    <div className='text-center p-4 bg-white rounded-[20px] hover:bg-[#611f69] transition-all duration-500 transform hover:scale-105 hover:shadow-xl group'>
                        <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-white transition-colors duration-500'>24×7</h3>
                        <p className='text-gray-600 mt-2 text-sm lg:text-base group-hover:text-white transition-colors duration-500'>Online Business</p>
                    </div>
                    <div className='text-center p-4 bg-white rounded-[20px] hover:bg-[#611f69] transition-all duration-500 transform hover:scale-105 hover:shadow-xl group'>
                        <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-white transition-colors duration-500'>7</h3>
                        <p className='text-gray-600 mt-2 text-sm lg:text-base group-hover:text-white transition-colors duration-500'>days* payment</p>
                    </div>
                    <div className='text-center p-4 bg-white rounded-[20px] hover:bg-[#611f69] transition-all duration-500 transform hover:scale-105 hover:shadow-xl group'>
                        <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-white transition-colors duration-500'>19000+</h3>
                        <p className='text-gray-600 mt-2 text-sm lg:text-base group-hover:text-white transition-colors duration-500'>Pincodes served</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SellerHero
