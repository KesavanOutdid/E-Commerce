'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useKYC } from '@/hooks/useKYC'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'

export default function KYCPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { kycStatus, loading, fetchKYCStatus, submitKYCRequest } = useKYC()
    const hasFetchedKYC = useRef(false)
    const [formData, setFormData] = useState({
        shopName: '',
        gstin: '',
        panNumber: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        shopAddress: {
            doorNo: '',
            street: '',
            landmark: '',
            city: '',
            district: '',
            state: '',
            country: '',
            pincode: '',
        },
    })
    const [originalData, setOriginalData] = useState({
        shopName: '',
        gstin: '',
        panNumber: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        shopAddress: {
            doorNo: '',
            street: '',
            landmark: '',
            city: '',
            district: '',
            state: '',
            country: '',
            pincode: '',
        },
    })
    const [shopLogo, setShopLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isFormValid = () => {
        return (
            formData.shopName.trim() !== '' &&
            formData.gstin.trim() !== '' &&
            formData.panNumber.trim() !== '' &&
            formData.accountNumber.trim() !== '' &&
            formData.ifscCode.trim() !== '' &&
            formData.accountHolderName.trim() !== '' &&
            formData.bankName.trim() !== '' &&
            formData.shopAddress.doorNo.trim() !== '' &&
            formData.shopAddress.street.trim() !== '' &&
            formData.shopAddress.city.trim() !== '' &&
            formData.shopAddress.state.trim() !== '' &&
            formData.shopAddress.country.trim() !== '' &&
            formData.shopAddress.pincode.trim() !== ''
        )
    }

    const hasFormChanged = () => {
        return (
            formData.shopName !== originalData.shopName ||
            formData.gstin !== originalData.gstin ||
            formData.panNumber !== originalData.panNumber ||
            formData.accountNumber !== originalData.accountNumber ||
            formData.ifscCode !== originalData.ifscCode ||
            formData.accountHolderName !== originalData.accountHolderName ||
            formData.bankName !== originalData.bankName ||
            JSON.stringify(formData.shopAddress) !== JSON.stringify(originalData.shopAddress) ||
            shopLogo !== null
        )
    }

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            setShopLogo(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAddressChange = (field: string, value: string) => {
        setFormData({
            ...formData,
            shopAddress: {
                ...formData.shopAddress,
                [field]: value,
            }
        })
    }

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }
        if (!hasFetchedKYC.current) {
            fetchKYCStatus()
            hasFetchedKYC.current = true
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (user?.sellerInfo) {
            const initialData = {
                shopName: user.sellerInfo.shopName || '',
                gstin: user.sellerInfo.gstin || '',
                panNumber: user.sellerInfo.panNumber || '',
                accountNumber: user.sellerInfo.bankDetails?.accountNumber || '',
                ifscCode: user.sellerInfo.bankDetails?.ifscCode || '',
                accountHolderName: user.sellerInfo.bankDetails?.accountHolderName || '',
                bankName: user.sellerInfo.bankDetails?.bankName || '',
                shopAddress: {
                    doorNo: user.sellerInfo.shopAddress?.doorNo || '',
                    street: user.sellerInfo.shopAddress?.street || '',
                    landmark: user.sellerInfo.shopAddress?.landmark || '',
                    city: user.sellerInfo.shopAddress?.city || '',
                    district: user.sellerInfo.shopAddress?.district || '',
                    state: user.sellerInfo.shopAddress?.state || '',
                    country: user.sellerInfo.shopAddress?.country || '',
                    pincode: user.sellerInfo.shopAddress?.pincode || '',
                },
            }
            setFormData(initialData)
            setOriginalData(initialData)

            if (user.sellerInfo.shopLogo) {
                setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${user.sellerInfo.shopLogo}`)
            }
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const submitData = new FormData()
        submitData.append('shopName', formData.shopName)
        submitData.append('gstin', formData.gstin)
        submitData.append('panNumber', formData.panNumber)

        submitData.append('shopAddress[doorNo]', formData.shopAddress.doorNo)
        submitData.append('shopAddress[street]', formData.shopAddress.street)
        submitData.append('shopAddress[landmark]', formData.shopAddress.landmark)
        submitData.append('shopAddress[city]', formData.shopAddress.city)
        submitData.append('shopAddress[district]', formData.shopAddress.district)
        submitData.append('shopAddress[state]', formData.shopAddress.state)
        submitData.append('shopAddress[country]', formData.shopAddress.country)
        submitData.append('shopAddress[pincode]', formData.shopAddress.pincode)

        submitData.append('bankDetails[accountNumber]', formData.accountNumber)
        submitData.append('bankDetails[ifscCode]', formData.ifscCode)
        submitData.append('bankDetails[accountHolderName]', formData.accountHolderName)
        submitData.append('bankDetails[bankName]', formData.bankName)

        if (shopLogo) {
            submitData.append('shopLogo', shopLogo)
        }

        const result = await submitKYCRequest(submitData)
        if (result) {
            setIsEditing(false)
            setShopLogo(null)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setShopLogo(null)
        if (user?.sellerInfo) {
            const resetData = {
                shopName: user.sellerInfo.shopName || '',
                gstin: user.sellerInfo.gstin || '',
                panNumber: user.sellerInfo.panNumber || '',
                accountNumber: user.sellerInfo.bankDetails?.accountNumber || '',
                ifscCode: user.sellerInfo.bankDetails?.ifscCode || '',
                accountHolderName: user.sellerInfo.bankDetails?.accountHolderName || '',
                bankName: user.sellerInfo.bankDetails?.bankName || '',
                shopAddress: {
                    doorNo: user.sellerInfo.shopAddress?.doorNo || '',
                    street: user.sellerInfo.shopAddress?.street || '',
                    landmark: user.sellerInfo.shopAddress?.landmark || '',
                    city: user.sellerInfo.shopAddress?.city || '',
                    district: user.sellerInfo.shopAddress?.district || '',
                    state: user.sellerInfo.shopAddress?.state || '',
                    country: user.sellerInfo.shopAddress?.country || '',
                    pincode: user.sellerInfo.shopAddress?.pincode || '',
                },
            }
            setFormData(resetData)
            if (user.sellerInfo.shopLogo) {
                setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${user.sellerInfo.shopLogo}`)
            }
        }
    }

    const isKYCApproved = user?.sellerInfo?.kycApproved

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
            <Breadcrumb pageName="KYC Verification" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-black mb-2">KYC Verification</h1>
                                <p className="text-gray-600">
                                    Complete your KYC verification to start selling on our platform
                                </p>
                            </div>
                            {isKYCApproved && !isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2">
                                    <Icon icon="mdi:pencil" width={20} height={20} />
                                    Edit KYC Details
                                </button>
                            )}
                        </div>

                        {isKYCApproved && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <Icon icon="mdi:check-circle" className="text-green-500" width={24} height={24} />
                                <div>
                                    <p className="text-green-800 font-medium">KYC Approved</p>
                                    <p className="text-green-600 text-sm">Your KYC has been verified successfully</p>
                                </div>
                            </div>
                        )}

                        {user?.sellerInfo && !isEditing && (
                            <div className="mb-6">
                                {user.sellerInfo.shopLogo && (
                                    <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                            <Icon icon="mdi:store" width={20} height={20} className="text-primary" />
                                            Shop Logo
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-md">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${user.sellerInfo.shopLogo}`}
                                                    alt="Shop Logo"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Current Shop Logo</p>
                                                <p className="text-xs text-gray-500">This logo represents your shop</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {user.sellerInfo.shopAddress && (
                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                                        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                            <Icon icon="mdi:map-marker" width={20} height={20} className="text-primary" />
                                            Shop Address
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Door No</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.doorNo || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Street</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.street || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Landmark</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.landmark || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.city || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.district || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.state || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.country || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Pincode</label>
                                                <p className="text-sm text-gray-900 font-medium">{user.sellerInfo.shopAddress.pincode || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {loading && !kycStatus ? (
                            <div className="flex justify-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:briefcase" width={24} height={24} className="text-primary" />
                                        Business Information
                                    </h2>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Shop Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopName}
                                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    GSTIN <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.gstin}
                                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry GSTIN"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    PAN Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.panNumber}
                                                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry PAN Number"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Shop Logo
                                            </label>
                                            <div className="flex items-center gap-4">
                                                {logoPreview ? (
                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Shop Logo"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                        <Icon icon="mdi:store" width={40} height={40} className="text-gray-400" />
                                                    </div>
                                                )}
                                                {(!isKYCApproved || isEditing) && (
                                                    <div className="flex-1">
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoSelect}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                                                            {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                        </button>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Recommended: 500x500px, max 2MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:map-marker" width={24} height={24} className="text-primary" />
                                        Shop Address
                                    </h2>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Door No <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.doorNo}
                                                    onChange={(e) => handleAddressChange('doorNo', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Door No"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Street <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.street}
                                                    onChange={(e) => handleAddressChange('street', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Street"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Landmark
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.landmark}
                                                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Near Landmark"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.city}
                                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry City"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    District
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.district}
                                                    onChange={(e) => handleAddressChange('district', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry District"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    State <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.state}
                                                    onChange={(e) => handleAddressChange('state', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry State"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.country}
                                                    onChange={(e) => handleAddressChange('country', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Country"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pincode <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.shopAddress.pincode}
                                                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Pincode"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:bank" width={24} height={24} className="text-primary" />
                                        Bank Details
                                    </h2>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.accountNumber}
                                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Account Number"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    IFSC Code <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.ifscCode}
                                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry IFSC Code"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Account Holder Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.accountHolderName}
                                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry AC Holder Name"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bank Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.bankName}
                                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                                    disabled={isKYCApproved && !isEditing}
                                                    placeholder="Entry Bank Name"
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(!isKYCApproved || isEditing) && (
                                    <div className="flex justify-end gap-4 mt-8">
                                        {isKYCApproved && (
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading || !isFormValid() || !hasFormChanged()}
                                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader />
                                                    {isKYCApproved ? 'Updating...' : 'Submitting...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:check" width={20} height={20} />
                                                    {isKYCApproved ? 'Save Changes' : 'Submit KYC Request'}
                                                </>
                                            )}
                                        </button>
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
