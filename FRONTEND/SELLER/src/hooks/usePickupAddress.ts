import { useState } from 'react'
import { pickupAddressService } from '@/services/pickupAddressService'
import toast from 'react-hot-toast'

export const usePickupAddress = () => {
    const [loading, setLoading] = useState(false)
    const [addresses, setAddresses] = useState<any[]>([])

    const fetchAddresses = async () => {
        setLoading(true)
        try {
            const response = await pickupAddressService.getPickupAddresses()
            if (response.success) {
                setAddresses(response.data || [])
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch pickup addresses')
                return null
            }
        } catch (error: any) {
            console.error('Fetch pickup addresses error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch pickup addresses')
            return null
        } finally {
            setLoading(false)
        }
    }

    const addAddress = async (data: any) => {
        setLoading(true)
        try {
            const response = await pickupAddressService.addPickupAddress(data)
            if (response.success) {
                toast.success('Pickup address added successfully')
                setAddresses(response.data || [])
                return response.data
            } else {
                toast.error(response.message || 'Failed to add pickup address')
                return null
            }
        } catch (error: any) {
            console.error('Add pickup address error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to add pickup address')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateAddress = async (addressId: string, data: any) => {
        setLoading(true)
        try {
            const response = await pickupAddressService.updatePickupAddress(addressId, data)
            if (response.success) {
                toast.success('Pickup address updated successfully')
                setAddresses(response.data || [])
                return response.data
            } else {
                toast.error(response.message || 'Failed to update pickup address')
                return null
            }
        } catch (error: any) {
            console.error('Update pickup address error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to update pickup address')
            return null
        } finally {
            setLoading(false)
        }
    }

    const deleteAddress = async (addressId: string) => {
        setLoading(true)
        try {
            const response = await pickupAddressService.deletePickupAddress(addressId)
            if (response.success) {
                toast.success('Pickup address deleted successfully')
                setAddresses(response.data || [])
                return response.data
            } else {
                toast.error(response.message || 'Failed to delete pickup address')
                return null
            }
        } catch (error: any) {
            console.error('Delete pickup address error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to delete pickup address')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        addresses,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
    }
}
