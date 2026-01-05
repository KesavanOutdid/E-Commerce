'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'

const formatIndiaTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { profile, loading, fetchProfile, updateProfile } = useProfile()
    const [isEditing, setIsEditing] = useState(false)
    const hasFetchedProfile = useRef(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profileImage: '',
        addresses: [] as any[],
    })
    const [originalData, setOriginalData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profileImage: '',
        addresses: [] as any[],
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }
        if (!hasFetchedProfile.current) {
            fetchProfile()
            hasFetchedProfile.current = true
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        const data = profile || user
        if (data) {
            const initialData = {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                profileImage: data.profileImage || '',
                addresses: data.addresses || [],
            }
            setFormData(initialData)
            setOriginalData(initialData)
            setImagePreview(data.profileImage ? `${process.env.NEXT_PUBLIC_API_URL}${data.profileImage}` : '')
        }
    }, [profile, user])

    const hasFormChanged = () => {
        return (
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            JSON.stringify(formData.addresses) !== JSON.stringify(originalData.addresses) ||
            selectedImage !== null
        )
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const submitData = new FormData()
        submitData.append('firstName', formData.firstName)
        submitData.append('lastName', formData.lastName)
        submitData.append('addresses', JSON.stringify(formData.addresses))
        
        if (selectedImage) {
            submitData.append('profileImage', selectedImage)
        }
        
        const result = await updateProfile(submitData)
        if (result) {
            setIsEditing(false)
            setSelectedImage(null)
            await fetchProfile()
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setSelectedImage(null)
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                profileImage: profile.profileImage || '',
                addresses: profile.addresses || [],
            })
            setImagePreview(profile.profileImage ? `${process.env.NEXT_PUBLIC_API_URL}${profile.profileImage}` : '')
        }
    }

    const handleAddressChange = (index: number, field: string, value: string) => {
        const newAddresses = [...formData.addresses]
        if (!newAddresses[index]) {
            newAddresses[index] = {}
        }
        newAddresses[index][field] = value
        setFormData({ ...formData, addresses: newAddresses })
    }

    const addAddress = () => {
        setFormData({
            ...formData,
            addresses: [...formData.addresses, {
                doorNo: '',
                street: '',
                landmark: '',
                city: '',
                district: '',
                state: '',
                country: '',
                pincode: '',
            }]
        })
    }

    const removeAddress = (index: number) => {
        setFormData({
            ...formData,
            addresses: formData.addresses.filter((_, i) => i !== index)
        })
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
            <Breadcrumb pageName="Profile" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-black">My Profile</h1>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:pencil" width={20} height={20} />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {loading && !profile ? (
                            <div className="flex justify-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                                            {imagePreview ? (
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                                                    <span className="text-white text-4xl font-bold">
                                                        {formData.firstName?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all transform hover:scale-110"
                                                >
                                                    <Icon icon="mdi:camera" width={20} height={20} />
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500">
                                        {isEditing ? 'Click camera icon to change profile picture' : 'Profile Picture'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            required
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            required
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-6 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                                            <Icon icon="mdi:map-marker" width={24} height={24} className="text-primary" />
                                            Addresses
                                        </h2>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={addAddress}
                                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                                                <Icon icon="mdi:plus" width={20} height={20} />
                                                Add Address
                                            </button>
                                        )}
                                    </div>

                                    {formData.addresses.length === 0 ? (
                                        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                            <Icon icon="mdi:map-marker-off" width={48} height={48} className="mx-auto mb-2 opacity-50" />
                                            <p>No addresses added yet</p>
                                            {isEditing && <p className="text-sm mt-2">Click "Add Address" to add a new address</p>}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.addresses.map((address, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="font-medium text-black">Address {index + 1}</h3>
                                                        {isEditing && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAddress(index)}
                                                                className="text-red-500 hover:text-red-700">
                                                                <Icon icon="mdi:delete" width={20} height={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Door No
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.doorNo || ''}
                                                                onChange={(e) => handleAddressChange(index, 'doorNo', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Street
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.street || ''}
                                                                onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Landmark
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.landmark || ''}
                                                                onChange={(e) => handleAddressChange(index, 'landmark', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                City
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.city || ''}
                                                                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                District
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.district || ''}
                                                                onChange={(e) => handleAddressChange(index, 'district', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                State
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.state || ''}
                                                                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Country
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.country || ''}
                                                                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Pincode
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={address.pincode || ''}
                                                                onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !hasFormChanged()}
                                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                )}

                                {user?.sellerInfo && (
                                    <div className="border-t pt-6 mt-6">
                                        <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                            <Icon icon="mdi:store" width={24} height={24} className="text-primary" />
                                            Seller Information
                                        </h2>
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Shop Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.sellerInfo.shopName || 'N/A'}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        GSTIN
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.sellerInfo.gstin || 'N/A'}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        PAN Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.sellerInfo.panNumber || 'N/A'}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Commission Percentage
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.sellerInfo.commissionPercentage ? `${user.sellerInfo.commissionPercentage}%` : 'N/A'}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        KYC Status
                                                    </label>
                                                    <div className="flex items-center gap-2 px-4 py-3">
                                                        {user.sellerInfo.kycApproved ? (
                                                            <>
                                                                <Icon icon="mdi:check-circle" className="text-green-500" width={24} height={24} />
                                                                <span className="text-green-600 font-medium">Approved</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon icon="mdi:clock-outline" className="text-orange-500" width={24} height={24} />
                                                                <span className="text-orange-600 font-medium">Pending</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Store Status
                                                    </label>
                                                    <div className="flex items-center gap-2 px-4 py-3">
                                                        {user.sellerInfo.isLive ? (
                                                            <>
                                                                <Icon icon="mdi:check-circle" className="text-green-500" width={24} height={24} />
                                                                <span className="text-green-600 font-medium">Live</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon icon="mdi:close-circle" className="text-red-500" width={24} height={24} />
                                                                <span className="text-red-600 font-medium">Not Live</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Onboarding Completed
                                                    </label>
                                                    <div className="flex items-center gap-2 px-4 py-3">
                                                        {user.sellerInfo.onboardingCompleted ? (
                                                            <>
                                                                <Icon icon="mdi:check-circle" className="text-green-500" width={24} height={24} />
                                                                <span className="text-green-600 font-medium">Yes</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icon icon="mdi:close-circle" className="text-red-500" width={24} height={24} />
                                                                <span className="text-red-600 font-medium">No</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {user.sellerInfo.bankDetails && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                                    <Icon icon="mdi:bank" width={20} height={20} className="text-primary" />
                                                    Bank Details
                                                </h3>
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Account Number
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={user.sellerInfo.bankDetails.accountNumber || 'N/A'}
                                                                disabled
                                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                IFSC Code
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={user.sellerInfo.bankDetails.ifscCode || 'N/A'}
                                                                disabled
                                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Account Holder Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={user.sellerInfo.bankDetails.accountHolderName || 'N/A'}
                                                                disabled
                                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Bank Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={user.sellerInfo.bankDetails.bankName || 'N/A'}
                                                                disabled
                                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}
