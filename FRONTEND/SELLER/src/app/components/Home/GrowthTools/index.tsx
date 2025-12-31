import React from 'react'

const GrowthTools = () => {
    const tools = [
        {
            icon: '🏢',
            title: 'Fulfilment by Platform',
            description: 'Worried about storing, packing, shipping, and delivering your products? Let us do it all for you.',
            bgColor: 'bg-blue-50',
            link: 'Learn More'
        },
        {
            icon: '📢',
            title: 'Platform Ads',
            description: 'Curious how your products will stand out from your competitors and gain maximum visibility?',
            bgColor: 'bg-purple-50',
            link: 'Learn More'
        },
        {
            icon: '🎉',
            title: 'Shopping Festivals',
            description: "Get access to India's biggest shopping festivals, The Big Billion Day, Big Diwali Sale, and more.",
            bgColor: 'bg-orange-50',
            link: 'Learn More'
        },
        {
            icon: '📚',
            title: 'Learning Center',
            description: 'Personalised learning modules, exclusive webinars, tutorial videos, and more to help sell better faster.',
            bgColor: 'bg-green-50',
            link: 'Learn More'
        },
        {
            icon: '👤',
            title: 'Account Management',
            description: 'Improve product selection, product pricing, business insights, & more with our expert in-house account managers.',
            bgColor: 'bg-pink-50',
            link: 'Learn More'
        },
        {
            icon: '📱',
            title: 'Mobile App',
            description: 'Manage your online seller account 24×7 with Seller Hub App. Compatible with all Android & iOS devices.',
            bgColor: 'bg-yellow-50',
            link: 'Learn More'
        }
    ]

    return (
        <section className='bg-white py-12 lg:py-20'>
            <div className='container'>
                <div className='text-center mb-12 lg:mb-16 px-4'>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-4'>
                        Access our tools to <span className='text-primary'>grow faster</span> on Platform
                    </h2>
                    <p className='text-gray-600 max-w-3xl mx-auto mt-4 lg:mt-6 text-sm sm:text-base'>
                        We understand that your online business may require additional support from time to time, 
                        and we've got you covered. With your account, you gain access to a range of tools designed 
                        to help grow your online business.
                    </p>
                </div>

                <div className='mb-12 lg:mb-16 px-4'>
                    <div className='text-center mb-6 lg:mb-8'>
                        <h3 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600'>
                            5x Growth
                        </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
                        {tools.map((tool, index) => (
                            <div 
                                key={index}
                                className={`${tool.bgColor} p-6 lg:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className='text-4xl lg:text-5xl mb-3 lg:mb-4'>{tool.icon}</div>
                                <h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4'>
                                    {tool.title}
                                </h3>
                                <p className='text-gray-700 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base'>
                                    {tool.description}
                                </p>
                                <a 
                                    href='#' 
                                    className='text-primary font-semibold hover:underline inline-flex items-center gap-2 text-sm lg:text-base'
                                >
                                    {tool.link}
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                    </svg>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='bg-gradient-to-r from-primary to-purple-600 rounded-2xl lg:rounded-3xl p-6 lg:p-12 text-center text-white mx-4'>
                    <div className='mb-6 lg:mb-8'>
                        <div className='inline-block bg-white rounded-full p-4 lg:p-6 mb-4 lg:mb-6'>
                            <span className='text-4xl lg:text-6xl'>🛍️</span>
                        </div>
                        <h3 className='text-3xl lg:text-4xl font-bold mb-3 lg:mb-4'>
                            Shopsy
                        </h3>
                        <p className='text-lg lg:text-xl opacity-90'>
                            by Our Platform
                        </p>
                    </div>
                    
                    <h4 className='text-2xl lg:text-3xl font-bold mb-6'>
                        Your gateway to selling online
                    </h4>
                    
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto'>
                        <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6'>
                            <div className='text-3xl lg:text-4xl mb-2 lg:mb-3'>↩️</div>
                            <p className='font-semibold text-sm lg:text-base'>0 Returns*</p>
                        </div>
                        <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6'>
                            <div className='text-3xl lg:text-4xl mb-2 lg:mb-3'>👥</div>
                            <p className='font-semibold text-sm lg:text-base'>Access to budget-friendly customers</p>
                        </div>
                        <div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6'>
                            <div className='text-3xl lg:text-4xl mb-2 lg:mb-3'>💰</div>
                            <p className='font-semibold text-sm lg:text-base'>Lowest cost of doing business</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default GrowthTools
