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

    getSellerProducts: async (userId: string, page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/products/seller/getproducts?userId=${userId}&page=${page}&limit=${limit}`)
        return response.data
    },

    getProductById: async (productId: string) => {
        const response = await axios.get(`/api/products/${productId}`)
        // const response = await axios.get(`/api/products/seller/${productId}`)
        return response.data
    },

    updateProduct: async (productId: string, formData: FormData) => {
        const response = await axios.put(`/api/products/seller/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    deleteProduct: async (productId: string) => {
        const response = await axios.delete(`/api/products/seller/${productId}`)
        return response.data
    },
}
