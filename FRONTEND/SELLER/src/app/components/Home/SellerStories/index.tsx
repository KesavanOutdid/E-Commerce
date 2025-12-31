'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import withBasePath from '@/utils/basePath'

const SellerStories = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

    const stories = [
        {
            name: 'Raju Lunawath',
            business: 'Amazestore',
            avatarImage: withBasePath('/images/mentor/boy1.svg'),
            quote: "Our platform's support & innovation fueled my exponential growth. I started with 1 category and moved to 6 categories with an astounding 5x Year on Year expansion!",
            bgColor: 'bg-yellow-400'
        },
        {
            name: 'Priya Sharma',
            business: 'Fashion Hub',
            avatarImage: withBasePath('/images/mentor/girl1.svg'),
            quote: "The ease of managing my online store and reaching millions of customers has transformed my small business into a thriving enterprise.",
            bgColor: 'bg-blue-400'
        },
        {
            name: 'Amit Patel',
            business: 'Tech Solutions',
            avatarImage: withBasePath('/images/mentor/boy2.svg'),
            quote: "With exceptional logistics support and payment cycles, I've been able to scale my business faster than I ever imagined possible.",
            bgColor: 'bg-green-400'
        }
    ]

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % stories.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + stories.length) % stories.length)
    }

    return (
        <section className='bg-gradient-to-br from-blue-50 to-purple-50 py-12 lg:py-20'>
            <div className='container'>
                <div className='text-center mb-12 lg:mb-16 px-4'>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4'>
                        <span className='text-primary'>Seller Success</span> Stories
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto text-sm sm:text-base'>
                        14 Lakh+ sellers trust our platform for their online business.
                    </p>
                </div>

                <div className='relative max-w-4xl mx-auto px-4'>
                    <div className='bg-white rounded-2xl shadow-2xl p-6 lg:p-12 min-h-80 lg:min-h-96 flex flex-col items-center justify-center text-center'>
                        <div className={`${stories[currentSlide].bgColor} rounded-full w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex items-center justify-center mb-6 lg:mb-8 overflow-hidden`}>
                            <Image 
                                src={stories[currentSlide].avatarImage} 
                                alt={stories[currentSlide].name}
                                width={160}
                                height={160}
                                className='w-full h-full object-cover'
                            />
                        </div>
                        
                        <h3 className='text-xl lg:text-2xl font-bold text-gray-900 mb-2'>
                            {stories[currentSlide].name},
                        </h3>
                        <p className='text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8'>
                            {stories[currentSlide].business}
                        </p>
                        
                        <div className='text-4xl lg:text-6xl text-gray-300 mb-3 lg:mb-4'>"</div>
                        <p className='text-base lg:text-lg text-gray-700 max-w-2xl leading-relaxed italic px-4'>
                            {stories[currentSlide].quote}
                        </p>
                    </div>

                    <button
                        onClick={prevSlide}
                        className='hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                        <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                        </svg>
                    </button>
                    
                    <button
                        onClick={nextSlide}
                        className='hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                        <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                    </button>

                    <div className='flex justify-center gap-2 mt-8'>
                        {stories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                    index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SellerStories
