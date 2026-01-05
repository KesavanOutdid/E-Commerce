import { useState } from 'react'
import { kycService } from '@/services/kycService'
import toast from 'react-hot-toast'

export const useKYC = () => {
    const [loading, setLoading] = useState(false)
    const [kycStatus, setKycStatus] = useState<any>(null)

    const fetchKYCStatus = async () => {
        setLoading(true)
        try {
            const response = await kycService.getKYCStatus()
            if (response.success) {
                setKycStatus(response.data)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch KYC status')
                return null
            }
        } catch (error: any) {
            console.error('Fetch KYC status error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch KYC status')
            return null
        } finally {
            setLoading(false)
        }
    }

    const submitKYCRequest = async (data: any) => {
        setLoading(true)
        try {
            const response = await kycService.submitKYC(data)
            if (response.success) {
                toast.success('KYC request submitted successfully')
                setKycStatus(response.data)
                return response.data
            } else {
                toast.error(response.message || 'Failed to submit KYC request')
                return null
            }
        } catch (error: any) {
            console.error('Submit KYC request error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to submit KYC request')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        kycStatus,
        fetchKYCStatus,
        submitKYCRequest,
    }
}
