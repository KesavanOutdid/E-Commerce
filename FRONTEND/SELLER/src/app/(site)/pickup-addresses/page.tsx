'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usePickupAddress } from '@/hooks/usePickupAddress'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import axios from 'axios'
import toast from 'react-hot-toast'

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
]

interface PickupAddress {
    id: string
    name: string
    addressLine1: string
    landmark?: string
    city: string
    district: string
    state: string
    country: string
    pincode: string
    phone: string
    createdAt?: string
}

export default function PickupAddressesPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()
    const { loading, addresses, fetchAddresses, addAddress, updateAddress, deleteAddress } = usePickupAddress()
    const hasFetchedAddresses = useRef(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [fetchingPincode, setFetchingPincode] = useState(false)
    const [formData, setFormData] = useState<Omit<PickupAddress, 'id' | 'createdAt'>>({
        name: '',
        addressLine1: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        country: 'India',
        pincode: '',
        phone: '',
    })

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedAddresses.current) {
            fetchAddresses()
            hasFetchedAddresses.current = true
        }
    }, [isAuthenticated, isLoading, router])

    const handleOpenModal = (address?: PickupAddress) => {
        if (address) {
            setEditingAddress(address)
            setFormData({
                name: address.name,
                addressLine1: address.addressLine1,
                landmark: address.landmark || '',
                city: address.city,
                district: address.district,
                state: address.state,
                country: address.country,
                pincode: address.pincode,
                phone: address.phone,
            })
        } else {
            setEditingAddress(null)
            setFormData({
                name: '',
                addressLine1: '',
                landmark: '',
                city: '',
                district: '',
                state: '',
                country: 'India',
                pincode: '',
                phone: '',
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingAddress(null)
        setFormData({
            name: '',
            addressLine1: '',
            landmark: '',
            city: '',
            district: '',
            state: '',
            country: 'India',
            pincode: '',
            phone: '',
        })
    }

    const fetchPincodeData = async (pincode: string) => {
        try {
            setFetchingPincode(true)
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
            if (response.data[0]?.Status === "Success") {
                const postOffice = response.data[0].PostOffice[0]
                setFormData(prev => ({
                    ...prev,
                    city: postOffice.Block !== "NA" ? postOffice.Block : postOffice.Name,
                    district: postOffice.District,
                    state: postOffice.State
                }))
                toast.success('Location details fetched successfully')
            } else {
                toast.error('Invalid pincode or no data found')
            }
        } catch (error) {
            console.error("Error fetching pincode data:", error)
            toast.error('Failed to fetch pincode details')
        } finally {
            setFetchingPincode(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        
        if (name === 'phone') {
            const phoneValue = value.replace(/\D/g, '')
            if (phoneValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: phoneValue }))
            }
        } else if (name === 'pincode') {
            const pincodeValue = value.replace(/\D/g, '')
            if (pincodeValue.length <= 6) {
                setFormData(prev => ({ ...prev, [name]: pincodeValue }))
                if (pincodeValue.length === 6) {
                    fetchPincodeData(pincodeValue)
                }
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (editingAddress) {
            const result = await updateAddress(editingAddress.id, formData)
            if (result !== null) {
                handleCloseModal()
                await fetchAddresses()
            }
        } else {
            const result = await addAddress(formData)
            if (result !== null) {
                handleCloseModal()
                await fetchAddresses()
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        const result = await deleteAddress(deleteConfirm)
        if (result !== null) {
            setDeleteConfirm(null)
            await fetchAddresses()
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <>
            <Breadcrumb pageName="Pickup Addresses" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    {loading && !addresses.length ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-black mb-2">Pickup Addresses</h1>
                                    <p className="text-gray-600 text-sm">
                                        Manage your pickup addresses for order fulfillment
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:plus" width={20} height={20} />
                                    Add New Address
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <Icon icon="mdi:map-marker-off" width={64} height={64} className="mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-xl font-semibold text-black mb-2">No Pickup Addresses</h3>
                                    <p className="text-gray-600 mb-4">
                                        Add your first pickup address to start fulfilling orders
                                    </p>
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                                        <Icon icon="mdi:plus" width={20} height={20} />
                                        Add Pickup Address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-primary/30 transition">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-start gap-3">
                                                    <Icon icon="mdi:map-marker" className="text-primary mt-1" width={24} height={24} />
                                                    <div>
                                                        <h3 className="text-lg font-bold text-black">{address.name}</h3>
                                                        <p className="text-sm text-gray-500">Location</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(address)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition">
                                                        <Icon icon="mdi:pencil" width={18} height={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(address.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition">
                                                        <Icon icon="mdi:delete" width={18} height={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-700">
                                                    <Icon icon="mdi:home" className="inline mr-2" width={16} height={16} />
                                                    {address.addressLine1}
                                                </p>
                                                {address.landmark && (
                                                    <p className="text-sm text-gray-700">
                                                        <Icon icon="mdi:sign-direction" className="inline mr-2" width={16} height={16} />
                                                        {address.landmark}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-700">
                                                    <Icon icon="mdi:city" className="inline mr-2" width={16} height={16} />
                                                    {address.city}, {address.district}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <Icon icon="mdi:map" className="inline mr-2" width={16} height={16} />
                                                    {address.state}, {address.country} - {address.pincode}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <Icon icon="mdi:phone" className="inline mr-2" width={16} height={16} />
                                                    {address.phone}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-black">
                                {editingAddress ? 'Edit Pickup Address' : 'Add New Pickup Address'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition">
                                <Icon icon="mdi:close" width={24} height={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Main Warehouse"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 1 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Landmark (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                required
                                                maxLength={6}
                                                pattern="[0-9]{6}"
                                                placeholder="6-digit pincode"
                                            />
                                            {fetchingPincode && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Icon icon="mdi:loading" className="animate-spin text-primary" width={20} height={20} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            placeholder="10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            District <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {INDIAN_STATES.map((state) => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            readOnly
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || fetchingPincode}
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Saving...' : fetchingPincode ? 'Fetching location...' : editingAddress ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Icon icon="mdi:alert" className="text-red-600" width={24} height={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">Delete Address</h3>
                                <p className="text-sm text-gray-600">Are you sure you want to delete this pickup address?</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                                No
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                                {loading ? 'Deleting...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
