import axios from '@/lib/axios'

export const kycService = {
    submitKYC: async (data: {
        shopName: string
        gstin: string
        panNumber: string
        bankDetails: {
            accountNumber: string
            ifscCode: string
            accountHolderName: string
            bankName: string
        }
    }) => {
        const response = await axios.post('/api/seller/kyc/request', data)
        return response.data
    },

    getKYCStatus: async () => {
        const response = await axios.get('/api/seller/kyc/status')
        return response.data
    },
}
