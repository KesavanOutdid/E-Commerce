import axios from '@/lib/axios'

export const pickupAddressService = {
    getPickupAddresses: async () => {
        const response = await axios.get('/api/seller/pickup-addresses')
        return response.data
    },

    addPickupAddress: async (data: any) => {
        const response = await axios.post('/api/seller/pickup-addresses', data)
        return response.data
    },

    updatePickupAddress: async (addressId: string, data: any) => {
        const response = await axios.put(`/api/seller/pickup-addresses/${addressId}`, data)
        return response.data
    },

    deletePickupAddress: async (addressId: string) => {
        const response = await axios.delete(`/api/seller/pickup-addresses/${addressId}`)
        return response.data
    },
}
