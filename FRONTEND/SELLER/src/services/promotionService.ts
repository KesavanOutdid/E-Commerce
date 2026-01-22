import axios from '@/lib/axios'

export const promotionService = {
    createCoupon: async (formData: FormData) => {
        const response = await axios.post('/api/seller/promotions/coupons', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getCoupons: async () => {
        const response = await axios.get('/api/seller/promotions/coupons')
        return response.data
    },

    getCouponById: async (id: string) => {
        const response = await axios.get(`/api/seller/promotions/coupons/${id}`)
        return response.data
    },

    updateCoupon: async (id: string, formData: FormData) => {
        const response = await axios.put(`/api/seller/promotions/coupons/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    deleteCoupon: async (id: string) => {
        const response = await axios.delete(`/api/seller/promotions/coupons/${id}`)
        return response.data
    },

    createOffer: async (formData: FormData) => {
        const response = await axios.post('/api/seller/promotions/offers', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getOffers: async () => {
        const response = await axios.get('/api/seller/promotions/offers')
        return response.data
    },

    getOfferById: async (id: string) => {
        const response = await axios.get(`/api/seller/promotions/offers/${id}`)
        return response.data
    },

    updateOffer: async (id: string, formData: FormData) => {
        const response = await axios.put(`/api/seller/promotions/offers/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    deleteOffer: async (id: string) => {
        const response = await axios.delete(`/api/seller/promotions/offers/${id}`)
        return response.data
    },
}
