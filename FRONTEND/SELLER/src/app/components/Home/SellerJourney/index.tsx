import React from 'react'

const SellerJourney = () => {
    const steps = [
        {
            icon: '🏪',
            title: 'Create',
            description: 'Register in just 10 mins with valid GST, address, & bank details.',
            illustration: '💻'
        },
        {
            icon: '📝',
            title: 'List',
            description: 'List your products (min 1 no.) that you want to sell on the platform.',
            illustration: '📦'
        },
        {
            icon: '🛒',
            title: 'Orders',
            description: 'Receive orders from over 45 crore+ customers.',
            illustration: '📍'
        },
        {
            icon: '🚚',
            title: 'Shipment',
            description: 'We ensure stress free delivery of your products.',
            illustration: '📍'
        },
        {
            icon: '💰',
            title: 'Payment',
            description: 'Receive payment 7 days* from the date of dispatch of your order.',
            illustration: '🏦'
        }
    ]

    return (
        <section className='bg-white'>
            <div className='container'>
                <div className='text-center mb-16'>
                    <h2 className='text-5xl font-bold mb-4'>
                        <span className='text-primary'>Your Journey</span> on our Platform
                    </h2>
                    <p className='text-gray-600 max-w-3xl mx-auto'>
                        Starting your online business with us is easy. 14 lakh+ sellers trust our platform with their business
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
                    {steps.map((step, index) => (
                        <div key={index} className='text-center'>
                            <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl h-30 flex flex-col items-center justify-center mb-6 hover:shadow-xl transition-shadow duration-300'>
                                {/* <div className='text-6xl mb-4'>{step.illustration}</div> */}
                                <div className='text-5xl'>{step.icon}</div>
                            </div>
                            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                                {step.title}
                            </h3>
                            <p className='text-gray-600 text-sm leading-relaxed'>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SellerJourney
