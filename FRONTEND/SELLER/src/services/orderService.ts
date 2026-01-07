import axios from '@/lib/axios'

export const orderService = {
    getSellerOrders: async (page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/orders/seller?page=${page}&limit=${limit}`)
        return response.data
    },

    getOrderById: async (orderId: string) => {
        const response = await axios.get(`/api/orders/seller/${orderId}`)
        return response.data
    },

    searchOrders: async (search: string, page: number = 1, limit: number = 10) => {
        const response = await axios.get(`/api/orders/seller/search?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)
        return response.data
    },
}
