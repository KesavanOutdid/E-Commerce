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
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    {isKYCApproved && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <Icon icon="mdi:check-circle" className="text-green-500" width={24} height={24} />
                            <div>
                                <p className="text-green-800 font-semibold text-sm">KYC Approved</p>
                                <p className="text-green-600 text-xs">Your KYC has been verified successfully</p>
                            </div>
                        </div>
                    )}

                    {loading && !kycStatus ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-black mb-1 flex items-center gap-2">
                                            <Icon icon="mdi:briefcase" className="text-primary" width={24} height={24} />
                                            Business Information
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {isKYCApproved ? 'Your business details' : 'Complete your KYC verification to start selling'}
                                        </p>
                                    </div>
                                    {isKYCApproved && !isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="text-gray-400 hover:text-primary transition">
                                            <Icon icon="mdi:pencil" width={20} height={20} />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="rounded-lg p-6 mb-4 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                    {(!isKYCApproved || isEditing || logoPreview) && (
                                        <div className="mb-6 pb-6 border-b border-primary/20">
                                            {logoPreview && (
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border-3 border-primary shadow-lg flex-shrink-0 bg-white">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Shop Logo"
                                                            className="w-full h-full object-contain p-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-gray-900">Shop Logo</p>
                                                        <p className="text-sm text-gray-600">{formData.shopName || 'Your Shop'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {(!isKYCApproved || isEditing) && (
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-3">Shop Logo</label>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm">
                                                            <Icon icon="mdi:upload" width={18} height={18} />
                                                            {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                        </button>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleLogoSelect}
                                                            className="hidden"
                                                        />
                                                        {shopLogo && (
                                                            <p className="text-xs text-gray-600">Selected: {shopLogo.name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Shop Name {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopName || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopName}
                                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            GSTIN {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.gstin || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.gstin}
                                                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                                placeholder="Enter GSTIN"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            PAN Number {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.panNumber || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.panNumber}
                                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                                placeholder="Enter PAN Number"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:map-marker-radius" className="text-teal-600" width={24} height={24} />
                                    Shop Address
                                </h2>
                                <div className="rounded-lg p-6 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Door No {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.doorNo || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.doorNo}
                                                onChange={(e) => handleAddressChange('doorNo', e.target.value)}
                                                placeholder="Enter Door No"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Street {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.street || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.street}
                                                onChange={(e) => handleAddressChange('street', e.target.value)}
                                                placeholder="Enter Street"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Landmark</label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.landmark || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.landmark}
                                                onChange={(e) => handleAddressChange('landmark', e.target.value)}
                                                placeholder="Enter Landmark"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            City {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.city || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.city}
                                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                                placeholder="Enter City"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">District</label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.district || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.district}
                                                onChange={(e) => handleAddressChange('district', e.target.value)}
                                                placeholder="Enter District"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            State {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.state || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.state}
                                                onChange={(e) => handleAddressChange('state', e.target.value)}
                                                placeholder="Enter State"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Country {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.country || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.country}
                                                onChange={(e) => handleAddressChange('country', e.target.value)}
                                                placeholder="Enter Country"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Pincode {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.shopAddress.pincode || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.shopAddress.pincode}
                                                onChange={(e) => handleAddressChange('pincode', e.target.value)}
                                                placeholder="Enter Pincode"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:bank" className="text-orange-600" width={24} height={24} />
                                    Bank Details
                                </h2>
                                <div className="rounded-lg p-6 border-2 border-gray-200" style={{ backgroundColor: 'rgb(249, 249, 249)' }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Account Number {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.accountNumber || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.accountNumber}
                                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                                placeholder="Enter Account Number"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            IFSC Code {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.ifscCode || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.ifscCode}
                                                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                                placeholder="Enter IFSC Code"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Account Holder Name {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.accountHolderName || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.accountHolderName}
                                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                                placeholder="Enter Account Holder Name"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Bank Name {(!isKYCApproved || isEditing) && <span className="text-red-500">*</span>}
                                        </label>
                                        {isKYCApproved && !isEditing ? (
                                            <p className="text-sm text-black font-semibold">{formData.bankName || 'N/A'}</p>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.bankName}
                                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                                placeholder="Enter Bank Name"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        )}
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {(!isKYCApproved || isEditing) && (
                                <div className="flex justify-end gap-3">
                                    {isKYCApproved && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading || !isFormValid() || !hasFormChanged()}
                                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                                        {loading ? (
                                            <>
                                                <Loader />
                                                {isKYCApproved ? 'Updating...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:check" width={18} height={18} />
                                                {isKYCApproved ? 'Save Changes' : 'Submit KYC Request'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </section>
        </>
    )
}
