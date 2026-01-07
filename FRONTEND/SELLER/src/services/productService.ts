import axios from '@/lib/axios'

export const productService = {
    createProduct: async (formData: FormData) => {
        const response = await axios.post('/api/products/seller', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getSellerListings: async (page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/products/seller/listings?page=${page}&limit=${limit}`)
        return response.data
    },

    getAdminProducts: async (userId: string, page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/products/seller/getproducts?userId=${userId}&page=${page}&limit=${limit}`)
        return response.data
    },

    getProductById: async (id: string) => {
        const response = await axios.get(`/api/products/seller/${id}`)
        return response.data
    },

    updateProduct: async (id: string, formData: FormData) => {
        const response = await axios.put(`/api/products/seller/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    deleteProduct: async (id: string) => {
        const response = await axios.delete(`/api/products/seller/${id}`)
        return response.data
    },

    createListing: async (data: { productId: string; price: number; salePrice?: number; stock: number; deliveryDays: number }) => {
        const response = await axios.post('/api/products/seller/list', data)
        return response.data
    },

    updateListing: async (listingId: string, data: { price?: number; salePrice?: number; stock?: number; deliveryDays?: number; sellerStatus?: string }) => {
        const response = await axios.put(`/api/products/seller/listing/${listingId}`, data)
        return response.data
    },

    deleteListing: async (listingId: string) => {
        const response = await axios.delete(`/api/products/seller/listing/${listingId}`)
        return response.data
    },
}
