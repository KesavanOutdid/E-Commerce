'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'

const formatIndiaTime = (dateString: string | null) => {
    if (!dateString) return '-'
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
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            const maxSize = 2 * 1024 * 1024

            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Allowed types: JPG, JPEG, PNG, WEBP')
                e.target.value = ''
                return
            }

            if (file.size > maxSize) {
                alert('File size too large. Maximum allowed size is 2MB')
                e.target.value = ''
                return
            }

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
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    {loading && !profile ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="relative group flex-shrink-0">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-3 border-primary shadow-lg">
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
                                                    className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all"
                                                >
                                                    <Icon icon="mdi:camera" width={18} height={18} />
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

                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-3xl font-bold text-primary mb-1">
                                            {formData.firstName} {formData.lastName}
                                        </h1>
                                        <p className="text-primary text-sm mb-1">Seller Account</p>
                                        {user?.sellerInfo && (
                                            <p className="text-gray-600 text-sm">{user.sellerInfo.shopName || 'Shop Name Not Set'}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-gray-50 p-4 rounded-lg flex-shrink-0">
                                        {/* <div>
                                            <p className="text-xs text-gray-500 mb-1">Seller ID:</p>
                                            <p className="text-sm font-semibold text-black">{user?.sellerId || '-'}</p>
                                        </div> */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Phone number</p>
                                            <p className="text-sm font-semibold text-black">{formData.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <p className="text-sm font-semibold text-black truncate">{formData.email || '-'}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-xs text-gray-500 mb-1">Account</p>
                                            <p className="text-sm font-semibold text-black">{user?.role || 'Seller'}</p>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                        <Icon icon="mdi:account" className="text-blue-600" width={24} height={24} />
                                        Personal Information
                                    </h2>
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="text-gray-400 hover:text-primary transition">
                                            <Icon icon="mdi:pencil" width={20} height={20} />
                                        </button>
                                    )}
                                </div>
                                <div className="rounded-lg p-6 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">
                                                First Name {isEditing && <span className="text-red-500">*</span>}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                    required
                                                />
                                            ) : (
                                                <p className="text-sm text-black font-semibold">{formData.firstName || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">
                                                Last Name {isEditing && <span className="text-red-500">*</span>}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                    required
                                                />
                                            ) : (
                                                <p className="text-sm text-black font-semibold">{formData.lastName || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                                            <p className="text-sm text-black font-semibold">{formData.email || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                            <p className="text-sm text-black font-semibold">{formData.phone || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                        <Icon icon="mdi:map-marker" className="text-green-600" width={24} height={24} />
                                        Addresses
                                    </h2>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={addAddress}
                                            className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition text-sm">
                                            <Icon icon="mdi:plus" width={16} height={16} />
                                            Add Address
                                        </button>
                                    )}
                                </div>

                                <div className="rounded-lg p-6 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                    {formData.addresses.length === 0 ? (
                                        <div className="bg-white/70 p-6 rounded-lg text-center text-gray-500 border border-green-200">
                                            <Icon icon="mdi:map-marker-off" width={32} height={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No addresses added yet</p>
                                            {isEditing && <p className="text-xs mt-1">Click "Add Address" to add a new address</p>}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.addresses.map((address, index) => (
                                                <div key={index} className="bg-white/70 border border-green-200 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="font-semibold text-sm text-black">Address {index + 1}</h3>
                                                        {isEditing && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAddress(index)}
                                                                className="text-red-500 hover:text-red-700">
                                                                <Icon icon="mdi:delete" width={18} height={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Door No</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.doorNo || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'doorNo', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.doorNo || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Street</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.street || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.street || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Landmark</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.landmark || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'landmark', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.landmark || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">City</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.city || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.city || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">District</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.district || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'district', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.district || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">State</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.state || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.state || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.country || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.country || '-'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={address.pincode || ''}
                                                                    onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-black font-semibold">{address.pincode || '-'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-3" style={{ paddingTop: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !hasFormChanged()}
                                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
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
                            </div>

                            {user?.sellerInfo && (
                                <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                    <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:store" className="text-primary" width={24} height={24} />
                                        Seller Information
                                    </h2>

                                    <div className="rounded-lg p-6 mb-4 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                        {user.sellerInfo.shopLogo && (
                                            <div className="mb-6 flex items-center gap-4 pb-4 border-b border-primary/20">
                                                <div className="w-24 h-24 rounded-lg overflow-hidden border-3 border-primary shadow-lg flex-shrink-0 bg-white">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${user.sellerInfo.shopLogo}`}
                                                        alt="Shop Logo"
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-gray-900">Shop Logo</p>
                                                    <p className="text-sm text-gray-600">{user.sellerInfo.shopName || 'Shop Name'}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Shop Name</label>
                                                <p className="text-sm text-black font-semibold">{user.sellerInfo.shopName || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">GSTIN</label>
                                                <p className="text-sm text-black font-semibold">{user.sellerInfo.gstin || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">PAN Number</label>
                                                <p className="text-sm text-black font-semibold">{user.sellerInfo.panNumber || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Commission Percentage</label>
                                                <p className="text-sm text-black font-semibold">{user.sellerInfo.commissionPercentage ? `${user.sellerInfo.commissionPercentage}%` : '-'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">KYC Status</label>
                                                <div className="flex items-center gap-1.5">
                                                    {user.sellerInfo.kycApproved ? (
                                                        <>
                                                            <Icon icon="mdi:check-circle" className="text-green-500" width={16} height={16} />
                                                            <span className="text-green-600 font-semibold text-sm">Approved</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon icon="mdi:clock-outline" className="text-orange-500" width={16} height={16} />
                                                            <span className="text-orange-600 font-semibold text-sm">Pending</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {/* <div>
                                                <label className="block text-xs text-gray-500 mb-1">Store Status</label>
                                                <div className="flex items-center gap-1.5">
                                                    {user.sellerInfo.isLive ? (
                                                        <>
                                                            <Icon icon="mdi:check-circle" className="text-green-500" width={16} height={16} />
                                                            <span className="text-green-600 font-semibold text-sm">Live</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon icon="mdi:close-circle" className="text-red-500" width={16} height={16} />
                                                            <span className="text-red-600 font-semibold text-sm">Not Live</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div> */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Onboarding Completed</label>
                                                <div className="flex items-center gap-1.5">
                                                    {user.sellerInfo.onboardingCompleted ? (
                                                        <>
                                                            <Icon icon="mdi:check-circle" className="text-green-500" width={16} height={16} />
                                                            <span className="text-green-600 font-semibold text-sm">Yes</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon icon="mdi:close-circle" className="text-red-500" width={16} height={16} />
                                                            <span className="text-red-600 font-semibold text-sm">No</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {user.sellerInfo.bankDetails && (
                                        <div className="rounded-lg p-6 mb-4 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                            <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2">
                                                <Icon icon="mdi:bank" className="text-orange-600" width={20} height={20} />
                                                Bank Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.bankDetails.accountNumber || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">IFSC Code</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.bankDetails.ifscCode || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Account Holder Name</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.bankDetails.accountHolderName || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.bankDetails.bankName || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user.sellerInfo.shopAddress && (
                                        <div className="rounded-lg p-6 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                            <h3 className="text-base font-semibold text-black mb-4 flex items-center gap-2">
                                                <Icon icon="mdi:map-marker-radius" className="text-teal-600" width={20} height={20} />
                                                Shop Address
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Door No</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.doorNo || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Street</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.street || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Landmark</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.landmark || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">City</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.city || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">District</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.district || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">State</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.state || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.country || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                                                    <p className="text-sm text-black font-semibold">{user.sellerInfo.shopAddress.pincode || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </section>
        </>
    )
}
