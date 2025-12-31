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
    })
    const [originalData, setOriginalData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    })

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
            }
            setFormData(initialData)
            setOriginalData(initialData)
        }
    }, [profile, user])

    const hasFormChanged = () => {
        return (
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await updateProfile(formData)
        if (result) {
            setIsEditing(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
            })
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
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Created At
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formatIndiaTime(user.sellerInfo.createdAt)}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Updated At
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formatIndiaTime(user.sellerInfo.updatedAt)}
                                                        disabled
                                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                    />
                                                </div>
                                                {user.sellerInfo.kycApprovedAt && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            KYC Approved At
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formatIndiaTime(user.sellerInfo.kycApprovedAt)}
                                                            disabled
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                        />
                                                    </div>
                                                )}
                                                {user.sellerInfo.kycApprovedBy && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            KYC Approved By
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={user.sellerInfo.kycApprovedBy}
                                                            disabled
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                        />
                                                    </div>
                                                )}
                                                {user.sellerInfo.goLiveApprovedAt && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Go Live Approved At
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formatIndiaTime(user.sellerInfo.goLiveApprovedAt)}
                                                            disabled
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                        />
                                                    </div>
                                                )}
                                                {user.sellerInfo.goLiveApprovedBy && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Go Live Approved By
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={user.sellerInfo.goLiveApprovedBy}
                                                            disabled
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-black cursor-not-allowed"
                                                        />
                                                    </div>
                                                )}
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
