import { useState } from 'react'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export const useProfile = () => {
    const { updateUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const response = await authService.getProfile()
            if (response.success) {
                setProfile(response.data)
                updateUser(response.data)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch profile')
                return null
            }
        } catch (error: any) {
            console.error('Fetch profile error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch profile')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (data: any) => {
        setLoading(true)
        try {
            const response = await authService.updateProfile(data)
            if (response.success) {
                toast.success('Profile updated successfully')
                setProfile(response.data)
                updateUser(response.data)
                return response.data
            } else {
                toast.error(response.message || 'Failed to update profile')
                return null
            }
        } catch (error: any) {
            console.error('Update profile error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to update profile')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        profile,
        fetchProfile,
        updateProfile,
    }
}
