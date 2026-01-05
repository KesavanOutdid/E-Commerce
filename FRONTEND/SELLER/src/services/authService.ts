import axios from '@/lib/axios'

export const authService = {
    login: async (identifier: string, password: string) => {
        const response = await axios.post('/api/seller/login', {
            identifier,
            password,
        })
        return response.data
    },

    sendOTP: async (email: string) => {
        const response = await axios.post('/api/seller/register/send-otp', {
            email,
        })
        return response.data
    },

    register: async (data: {
        firstName: string
        lastName: string
        email: string
        phone: string
        password: string
        otpCode: string
    }) => {
        const response = await axios.post('/api/seller/register', data)
        return response.data
    },

    getProfile: async () => {
        const response = await axios.get('/api/seller/profile')
        return response.data
    },

    updateProfile: async (data: any) => {
        const isFormData = data instanceof FormData
        const response = await axios.put('/api/seller/profile', data, {
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

    submitKYCRequest: async (data: {
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
}
