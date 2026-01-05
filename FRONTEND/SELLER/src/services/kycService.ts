import axios from '@/lib/axios'

export const kycService = {
    submitKYC: async (data: any) => {
        const isFormData = data instanceof FormData
        const response = await axios.post('/api/seller/kyc/request', data, {
            headers: isFormData ? {
                'Content-Type': 'multipart/form-data',
            } : undefined,
        })
        return response.data
    },

    getKYCStatus: async () => {
        const response = await axios.get('/api/seller/kyc/status')
        return response.data
    },
}
