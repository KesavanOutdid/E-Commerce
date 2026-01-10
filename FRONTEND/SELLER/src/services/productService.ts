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

    addVariant: async (masterProductId: string, formData: FormData) => {
        const response = await axios.post(`/api/products/seller/add-variant/${masterProductId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getProducts: async (page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/products/seller/getproducts?page=${page}&limit=${limit}`)
        return response.data
    },

    searchProducts: async (search: string, page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/products/seller/getproducts?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)
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

    checkProductBySlug: async (productName: string) => {
        const response = await axios.post('/api/products/seller/check-slug', { productName })
        return response.data
    },
}
