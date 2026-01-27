'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { promotionService } from '@/services/promotionService'
import { productService } from '@/services/productService'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
    _id: string
    productId: string
    productName: string
}

interface Coupon {
    _id: string
    couponId: string
    code: string
    description: string
    discountType: string
    discountValue: number
    minOrderValue: number
    maxDiscountAmount: number | null
    expiryDate: string
    usageLimit: number | null
    userLimit: number
    usedCount: number
    applicableTo: {
        type: string
        ids: string[]
    }
    status: boolean
    image?: string | string[]
}

interface Offer {
    _id: string
    offerId: string
    name: string
    description: string
    type: string
    discountType: string
    discountValue: number
    startDate: string
    endDate: string
    applicableTo: {
        type: string
        ids: string[]
    }
    status: boolean
    image?: string
}

export default function PromotionsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()
    const [activeTab, setActiveTab] = useState<'offers' | 'coupons'>('offers')
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [offers, setOffers] = useState<Offer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Coupon | Offer | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
    const hasFetched = useRef(false)

    const [couponForm, setCouponForm] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscountAmount: '',
        expiryDate: '',
        usageLimit: '',
        userLimit: '1',
        applicableType: 'product',
        applicableIds: [] as string[],
        status: true,
        image: null as File | null,
    })

    const [offerForm, setOfferForm] = useState({
        name: '',
        description: '',
        type: 'direct',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
        applicableType: 'product',
        applicableIds: [] as string[],
        status: true,
        image: null as File | null,
    })

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetched.current) {
            fetchAll()
            hasFetched.current = true
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isModalOpen || deleteConfirm) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isModalOpen, deleteConfirm])

    const fetchAll = async () => {
        setLoading(true)
        await Promise.all([fetchCoupons(), fetchOffers(), fetchProducts()])
        setLoading(false)
    }

    const fetchCoupons = async () => {
        try {
            const response = await promotionService.getCoupons()
            if (response.success) {
                setCoupons(response.data || [])
            }
        } catch (error: any) {
            console.error('Error fetching coupons:', error)
        }
    }

    const fetchOffers = async () => {
        try {
            const response = await promotionService.getOffers()
            if (response.success) {
                setOffers(response.data || [])
            }
        } catch (error: any) {
            console.error('Error fetching offers:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await productService.getProducts(1, 100)
            if (response.success) {
                setProducts(response.data.products || [])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleOpenModal = (item?: Coupon | Offer) => {
        if (item) {
            setEditingItem(item)
            if ('code' in item) {
                setCouponForm({
                    code: item.code,
                    description: item.description,
                    discountType: item.discountType,
                    discountValue: item.discountValue.toString(),
                    minOrderValue: item.minOrderValue.toString(),
                    maxDiscountAmount: item.maxDiscountAmount?.toString() || '',
                    expiryDate: new Date(item.expiryDate).toISOString().split('T')[0],
                    usageLimit: item.usageLimit?.toString() || '',
                    userLimit: item.userLimit.toString(),
                    applicableType: item.applicableTo.type,
                    applicableIds: item.applicableTo.ids,
                    status: item.status,
                    image: null,
                })
            } else {
                setOfferForm({
                    name: item.name,
                    description: item.description,
                    type: item.type,
                    discountType: item.discountType,
                    discountValue: item.discountValue.toString(),
                    startDate: new Date(item.startDate).toISOString().split('T')[0],
                    endDate: new Date(item.endDate).toISOString().split('T')[0],
                    applicableType: item.applicableTo.type,
                    applicableIds: item.applicableTo.ids,
                    status: item.status,
                    image: null,
                })
            }
        } else {
            setEditingItem(null)
            if (activeTab === 'coupons') {
                setCouponForm({
                    code: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minOrderValue: '',
                    maxDiscountAmount: '',
                    expiryDate: '',
                    usageLimit: '',
                    userLimit: '1',
                    applicableType: 'product',
                    applicableIds: [],
                    status: true,
                    image: null,
                })
            } else {
                setOfferForm({
                    name: '',
                    description: '',
                    type: 'direct',
                    discountType: 'percentage',
                    discountValue: '',
                    startDate: '',
                    endDate: '',
                    applicableType: 'product',
                    applicableIds: [],
                    status: true,
                    image: null,
                })
            }
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingItem(null)
    }

    const handleSubmitCoupon = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!couponForm.code || !couponForm.description || !couponForm.discountValue || !couponForm.expiryDate) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const submitData = new FormData()
            submitData.append('code', couponForm.code)
            submitData.append('description', couponForm.description)
            submitData.append('discountType', couponForm.discountType)
            submitData.append('discountValue', couponForm.discountValue)
            submitData.append('minOrderValue', couponForm.minOrderValue || '0')
            if (couponForm.maxDiscountAmount) {
                submitData.append('maxDiscountAmount', couponForm.maxDiscountAmount)
            }
            submitData.append('expiryDate', couponForm.expiryDate)
            if (couponForm.usageLimit) {
                submitData.append('usageLimit', couponForm.usageLimit)
            }
            submitData.append('userLimit', couponForm.userLimit)
            submitData.append('applicableType', couponForm.applicableType)
            submitData.append('applicableIds', JSON.stringify(couponForm.applicableIds))
            submitData.append('status', couponForm.status.toString())
            if (couponForm.image) {
                submitData.append('image', couponForm.image)
            }

            let response
            if (editingItem && 'code' in editingItem) {
                response = await promotionService.updateCoupon(editingItem._id, submitData)
            } else {
                response = await promotionService.createCoupon(submitData)
            }

            if (response.success) {
                toast.success(editingItem ? 'Coupon updated successfully' : 'Coupon created successfully')
                handleCloseModal()
                fetchCoupons()
            }
        } catch (error: any) {
            console.error('Error saving coupon:', error)
            toast.error(error.response?.data?.message || 'Failed to save coupon')
        }
    }

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!offerForm.name || !offerForm.description || !offerForm.discountValue || !offerForm.startDate || !offerForm.endDate) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            const submitData = new FormData()
            submitData.append('name', offerForm.name)
            submitData.append('description', offerForm.description)
            submitData.append('type', offerForm.type)
            submitData.append('discountType', offerForm.discountType)
            submitData.append('discountValue', offerForm.discountValue)
            submitData.append('startDate', offerForm.startDate)
            submitData.append('endDate', offerForm.endDate)
            submitData.append('applicableType', offerForm.applicableType)
            submitData.append('applicableIds', JSON.stringify(offerForm.applicableIds))
            submitData.append('status', offerForm.status.toString())
            if (offerForm.image) {
                submitData.append('image', offerForm.image)
            }

            let response
            if (editingItem && 'name' in editingItem) {
                response = await promotionService.updateOffer(editingItem._id, submitData)
            } else {
                response = await promotionService.createOffer(submitData)
            }

            if (response.success) {
                toast.success(editingItem ? 'Offer updated successfully' : 'Offer created successfully')
                handleCloseModal()
                fetchOffers()
            }
        } catch (error: any) {
            console.error('Error saving offer:', error)
            toast.error(error.response?.data?.message || 'Failed to save offer')
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            let response
            if (activeTab === 'coupons') {
                response = await promotionService.deleteCoupon(deleteConfirm.id)
            } else {
                response = await promotionService.deleteOffer(deleteConfirm.id)
            }

            if (response.success) {
                toast.success(`${activeTab === 'coupons' ? 'Coupon' : 'Offer'} deleted successfully`)
                setDeleteConfirm(null)
                if (activeTab === 'coupons') {
                    fetchCoupons()
                } else {
                    fetchOffers()
                }
            }
        } catch (error: any) {
            console.error('Error deleting:', error)
            toast.error(error.response?.data?.message || 'Failed to delete')
        }
    }

    const handleProductToggle = (productId: string) => {
        if (activeTab === 'coupons') {
            setCouponForm(prev => ({
                ...prev,
                applicableIds: prev.applicableIds.includes(productId)
                    ? prev.applicableIds.filter(id => id !== productId)
                    : [...prev.applicableIds, productId]
            }))
        } else {
            setOfferForm(prev => ({
                ...prev,
                applicableIds: prev.applicableIds.includes(productId)
                    ? prev.applicableIds.filter(id => id !== productId)
                    : [...prev.applicableIds, productId]
            }))
        }
    }

    if (isLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const currentItems = activeTab === 'coupons' ? coupons : offers
    const currentForm = activeTab === 'coupons' ? couponForm : offerForm

    return (
        <>
            <Breadcrumb pageName="Promotions" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10 min-h-screen">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-3">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon icon="mdi:view-dashboard" width={20} height={20} className="text-primary" />
                                        </div>
                                        Quick Links
                                    </h2>
                                    <p className="text-xs text-gray-500">Navigate sections</p>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        href="/products"
                                        className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102">
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white">
                                                    <Icon icon="mdi:storefront" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">My Products</span>
                                                    <span className="text-xs opacity-80">Your listings</span>
                                                </div>
                                            </div>
                                            <Icon icon="mdi:chevron-right" width={20} height={20} />
                                        </div>
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102">
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white">
                                                    <Icon icon="mdi:shopping" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">Orders</span>
                                                    <span className="text-xs opacity-80">Manage orders</span>
                                                </div>
                                            </div>
                                            <Icon icon="mdi:chevron-right" width={20} height={20} />
                                        </div>
                                    </Link>
                                    <div className="w-full relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg">
                                        <div className="px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/20">
                                                        <Icon icon={activeTab === 'offers' ? 'mdi:offer' : 'mdi:ticket-percent'} width={20} height={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-semibold block">
                                                            {activeTab === 'offers' ? 'Offers' : 'Coupons'}
                                                        </span>
                                                        <span className="text-xs opacity-80">Active Section</span>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/25 text-white">
                                                    {activeTab === 'offers' ? offers.length : coupons.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-9">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-black">Promotions</h2>
                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition flex items-center gap-2">
                                            <Icon icon="mdi:plus" width={20} height={20} />
                                            Add {activeTab === 'coupons' ? 'Coupon' : 'Offer'}
                                        </button>
                                    </div>

                                    <div className="flex gap-2 border-b border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('offers')}
                                            className={`px-6 py-3 font-medium transition-all ${activeTab === 'offers'
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}>
                                            <Icon icon="mdi:offer" width={20} height={20} className="inline mr-2" />
                                            Offers ({offers.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('coupons')}
                                            className={`px-6 py-3 font-medium transition-all ${activeTab === 'coupons'
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}>
                                            <Icon icon="mdi:ticket-percent" width={20} height={20} className="inline mr-2" />
                                            Coupons ({coupons.length})
                                        </button>
                                    </div>
                                </div>

                                {currentItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon
                                            icon={activeTab === 'coupons' ? 'mdi:ticket-percent' : 'mdi:offer'}
                                            width={64}
                                            height={64}
                                            className="mx-auto text-gray-300 mb-4"
                                        />
                                        <p className="text-gray-500 mb-4">No {activeTab} created yet</p>
                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                                            Create Your First {activeTab === 'coupons' ? 'Coupon' : 'Offer'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                        {activeTab === 'coupons' ? (
                                            coupons.map((coupon) => (
                                                <div key={coupon._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                                                    <div className="flex gap-4 mb-4">
                                                        {coupon.image ? (
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}${Array.isArray(coupon.image) ? coupon.image[0] : coupon.image}`}
                                                                alt={coupon.code}
                                                                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                <Icon icon="mdi:image-off" className="text-gray-400" width={24} height={24} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="text-lg font-bold text-black">{coupon.code}</h3>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className={`text-xs px-2 py-1 rounded ${coupon.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                                }`}>
                                                                {coupon.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:percent" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' ₹'} off
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:calendar" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:counter" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                Used: {coupon.usedCount}/{coupon.usageLimit || '∞'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(coupon)}
                                                            className="flex-1 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition flex items-center justify-center gap-2">
                                                            <Icon icon="mdi:pencil" width={16} height={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ id: coupon._id, name: coupon.code })}
                                                            className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2">
                                                            <Icon icon="mdi:delete" width={16} height={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            offers.map((offer) => (
                                                <div key={offer._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                                                    <div className="flex gap-4 mb-4">
                                                        {offer.image ? (
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}${offer.image}`}
                                                                alt={offer.name}
                                                                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                <Icon icon="mdi:image-off" className="text-gray-400" width={24} height={24} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="text-lg font-bold text-black">{offer.name}</h3>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className={`text-xs px-2 py-1 rounded ${offer.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                                }`}>
                                                                {offer.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:tag" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                Type: {offer.type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:percent" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                {offer.discountValue}{offer.discountType === 'percentage' ? '%' : ' ₹'} off
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Icon icon="mdi:calendar-range" width={16} height={16} className="text-primary" />
                                                            <span className="text-gray-700">
                                                                {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(offer)}
                                                            className="flex-1 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition flex items-center justify-center gap-2">
                                                            <Icon icon="mdi:pencil" width={16} height={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ id: offer._id, name: offer.name })}
                                                            className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2">
                                                            <Icon icon="mdi:delete" width={16} height={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-black">
                                {editingItem ? 'Edit' : 'Create'} {activeTab === 'coupons' ? 'Coupon' : 'Offer'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-black transition">
                                <Icon icon="material-symbols:close-rounded" width={24} height={24} />
                            </button>
                        </div>

                        <form onSubmit={activeTab === 'coupons' ? handleSubmitCoupon : handleSubmitOffer} className="p-6 space-y-4">
                            {activeTab === 'coupons' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Coupon Code <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={couponForm.code}
                                                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder="e.g., SAVE20"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={couponForm.discountType}
                                                onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required>
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Value <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={couponForm.discountValue}
                                                onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder={couponForm.discountType === 'percentage' ? '10' : '100'}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Min Order Value
                                            </label>
                                            <input
                                                type="number"
                                                value={couponForm.minOrderValue}
                                                onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Discount Amount
                                            </label>
                                            <input
                                                type="number"
                                                value={couponForm.maxDiscountAmount}
                                                onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder="Optional"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={couponForm.expiryDate}
                                                onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Usage Limit
                                            </label>
                                            <input
                                                type="number"
                                                value={couponForm.usageLimit}
                                                onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder="Unlimited"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                User Limit <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={couponForm.userLimit}
                                                onChange={(e) => setCouponForm({ ...couponForm, userLimit: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={couponForm.description}
                                            onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                            rows={3}
                                            placeholder="Describe your coupon..."
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Offer Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={offerForm.name}
                                                onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder="e.g., Flash Sale"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Offer Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={offerForm.type}
                                                onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required>
                                                <option value="direct">Direct Discount</option>
                                                <option value="quantity_tiered">Quantity Tiered</option>
                                                <option value="bundle">Bundle</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={offerForm.discountType}
                                                onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required>
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Value <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={offerForm.discountValue}
                                                onChange={(e) => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                placeholder={offerForm.discountType === 'percentage' ? '10' : '100'}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={offerForm.startDate}
                                                onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={offerForm.endDate}
                                                onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={offerForm.description}
                                            onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                            rows={3}
                                            placeholder="Describe your offer..."
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applicable Products
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                                    {products.length === 0 ? (
                                        <p className="text-sm text-gray-500">No products available</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {products.map((product) => (
                                                <label key={product._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentForm.applicableIds.includes(product._id)}
                                                        onChange={() => handleProductToggle(product._id)}
                                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-black">{product.productName}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null
                                        if (activeTab === 'coupons') {
                                            setCouponForm({ ...couponForm, image: file })
                                        } else {
                                            setOfferForm({ ...offerForm, image: file })
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={currentForm.status}
                                    onChange={(e) => {
                                        if (activeTab === 'coupons') {
                                            setCouponForm({ ...couponForm, status: e.target.checked })
                                        } else {
                                            setOfferForm({ ...offerForm, status: e.target.checked })
                                        }
                                    }}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                                    {editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-black mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
