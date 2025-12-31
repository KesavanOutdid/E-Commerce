import React from 'react'
import SellerHero from '@/app/components/Home/SellerHero'
import WhyChooseUs from '@/app/components/Home/WhyChooseUs'
import SellerStories from '@/app/components/Home/SellerStories'
import SellerJourney from '@/app/components/Home/SellerJourney'
import GrowthTools from '@/app/components/Home/GrowthTools'
import ContactForm from './components/Contact/Form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Seller Hub - Sign Up Online',
}

export default function Home() {
    return (
        <main>
            <SellerHero />
            <WhyChooseUs />
            <SellerStories />
            <SellerJourney />
            <GrowthTools />
            <ContactForm />
        </main>
    )
}
