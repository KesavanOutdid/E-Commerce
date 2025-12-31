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
    })
    const [originalData, setOriginalData] = useState({
        shopName: '',
        gstin: '',
        panNumber: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
    })

    const isFormValid = () => {
        return (
            formData.shopName.trim() !== '' &&
            formData.gstin.trim() !== '' &&
            formData.panNumber.trim() !== '' &&
            formData.accountNumber.trim() !== '' &&
            formData.ifscCode.trim() !== '' &&
            formData.accountHolderName.trim() !== '' &&
            formData.bankName.trim() !== ''
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
            formData.bankName !== originalData.bankName
        )
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
            }
            setFormData(initialData)
            setOriginalData(initialData)
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const kycData = {
            shopName: formData.shopName,
            gstin: formData.gstin,
            panNumber: formData.panNumber,
            bankDetails: {
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
            },
        }

        await submitKYCRequest(kycData)
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black mb-2">KYC Verification</h1>
                            <p className="text-gray-600">
                                Complete your KYC verification to start selling on our platform
                            </p>
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
                                                disabled={isKYCApproved}
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
                                                disabled={isKYCApproved}
                                                placeholder="29ABCDE1234F1Z5"
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
                                                disabled={isKYCApproved}
                                                placeholder="ABCDE1234F"
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
                                                disabled={isKYCApproved}
                                                placeholder="1234567890"
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
                                                disabled={isKYCApproved}
                                                placeholder="HDFC0001234"
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
                                                disabled={isKYCApproved}
                                                placeholder="John Doe"
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
                                                disabled={isKYCApproved}
                                                placeholder="HDFC Bank"
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                required
                                            />
                                        </div>
                                        </div>
                                    </div>
                                </div>

                                {!isKYCApproved && (
                                    <div className="flex justify-end gap-4 mt-8">
                                        {/* <button
                                            type="button"
                                            onClick={() => router.push('/profile')}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                            Cancel
                                        </button> */}
                                        <button
                                            type="submit"
                                            disabled={loading || !isFormValid() || !hasFormChanged()}
                                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:check" width={20} height={20} />
                                                    Submit KYC Request
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
