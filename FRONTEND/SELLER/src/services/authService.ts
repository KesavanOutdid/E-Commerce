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

    forgotPassword: async (email: string) => {
        const response = await axios.post('/api/seller/forgot-password', {
            email,
        })
        return response.data
    },

    validateOTP: async (otp: string, otpRef: string) => {
        const response = await axios.post('/api/seller/validate-otp', {
            otp,
            otpRef,
        })
        return response.data
    },

    setNewPassword: async (newPassword: string, confirmPassword: string, resetToken: string) => {
        const response = await axios.post('/api/seller/set-new-password', 
            {
                newPassword,
                confirmPassword,
            },
            {
                headers: {
                    'Authorization': `Bearer ${resetToken}`,
                },
            }
        )
        return response.data
    },

    getKYCStatus: async () => {
        const response = await axios.get('/api/seller/kyc/status')
        return response.data
    },
}
