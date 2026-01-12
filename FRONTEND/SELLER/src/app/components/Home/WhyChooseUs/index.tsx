import React from 'react'

const WhyChooseUs = () => {
    const features = [
        {
            icon: (
                <svg className='w-12 h-12 sm:w-14 sm:h-14' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z' />
                    <path d='M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z' />
                </svg>
            ),
            title: 'Opportunity',
            description: '45 crore+ of customers across 19000+ pincodes, and access to shopping festivals like The Big Billion Days, and more.',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            icon: (
                <svg className='w-12 h-12 sm:w-14 sm:h-14' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
            ),
            title: 'Ease of Doing Business',
            description: 'Create your seller account in under 10 minutes with just 1 product and a valid GSTIN number.',
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            icon: (
                <svg className='w-12 h-12 sm:w-14 sm:h-14' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z' clipRule='evenodd' />
                </svg>
            ),
            title: 'Growth',
            description: 'Sellers see an average 2.8X spike in growth, 2.3X more visibility, and up to 5X growth in The Big Billion Days Sale.',
            bgColor: 'bg-primary/10',
            iconColor: 'text-primary'
        },
        {
            icon: (
                <svg className='w-12 h-12 sm:w-14 sm:h-14' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z' clipRule='evenodd' />
                </svg>
            ),
            title: 'Additional Support',
            description: 'Account management services, exclusive training programs, business insights, catalogue/photoshoot support, and more.',
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600'
        }
    ]

    return (
        <section className='bg-white py-12 lg:py-20'>
            <div className='container'>
                <div className='text-center mb-12 lg:mb-16'>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 px-4'>
                        Why do <span className='text-primary'>sellers love selling</span> on our platform?
                    </h2>
                    <p className='text-gray-600 max-w-3xl mx-auto mt-4 lg:mt-6 px-4 text-sm sm:text-base'>
                        45 crore+ customers across India trust our platform to be their number 1 online shopping destination. 
                        It is no surprise that more than a million sellers trust their products to be made available 24×7 on our platform.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 px-4'>
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className={`${feature.bgColor} p-6 lg:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className='flex items-start gap-4'>
                                <div className={`${feature.iconColor} flex-shrink-0`}>
                                    {feature.icon}
                                </div>
                                <div className='flex-1'>
                                    <h3 className='text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-gray-700 leading-relaxed text-sm lg:text-base'>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyChooseUs
