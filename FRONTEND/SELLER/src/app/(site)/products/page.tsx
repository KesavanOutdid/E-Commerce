'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import ProductTableSkeleton from '@/app/components/Skeleton/ProductTable'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

type ProductCategory = 'own' | 'admin'

interface PriceModalData {
    type: 'create' | 'update'
    productId?: string
    listingId?: string
    productName: string
    currentPrice?: number
    currentSalePrice?: number
    currentStock?: number
    currentDeliveryDays?: number
    commissionPercentage?: number
}

export default function ProductsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    console.log(user)
    const {
        listings,
        adminProducts,
        loading,
        totalPages,
        totalListings,
        adminTotalPages,
        adminTotalProducts,
        fetchSellerListings,
        fetchAdminProducts,
        createListing,
        updateListing,
        deleteListing,
        deleteProduct,
        searchListings,
        searchAdminProducts
    } = useProducts()
    const hasFetchedProducts = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [adminCurrentPage, setAdminCurrentPage] = useState(1)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'listing' | 'product' } | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('own')
    const [priceModal, setPriceModal] = useState<PriceModalData | null>(null)
    const [priceFormData, setPriceFormData] = useState({
        price: '',
        salePrice: '',
        stock: '',
        deliveryDays: '3',
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [adminSearchQuery, setAdminSearchQuery] = useState('')

    const displayedProducts = selectedCategory === 'own' ? listings : adminProducts
    const displayedTotalPages = selectedCategory === 'own' ? totalPages : adminTotalPages
    const displayedTotalProducts = selectedCategory === 'own' ? totalListings : adminTotalProducts
    const displayedCurrentPage = selectedCategory === 'own' ? currentPage : adminCurrentPage

    const listingsMap = useMemo(() => {
        const map = new Map()
        listings.forEach(listing => {
            map.set(listing.productId, listing.sellerProductId)
        })
        return map
    }, [listings])

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedProducts.current && user?.userId) {
            fetchSellerListings(currentPage, 10)
            fetchAdminProducts(user.userId, adminCurrentPage, 10)
            hasFetchedProducts.current = true
        }
    }, [isAuthenticated, isLoading, router, user])

    useEffect(() => {
        if (hasFetchedProducts.current) {
            fetchSellerListings(currentPage, 10)
        }
    }, [currentPage])

    useEffect(() => {
        if (hasFetchedProducts.current && user?.userId) {
            fetchAdminProducts(user.userId, adminCurrentPage, 10)
        }
    }, [adminCurrentPage])

    const handleDelete = async () => {
        if (!deleteConfirm) return

        let success = false
        if (deleteConfirm.type === 'listing') {
            success = await deleteListing(deleteConfirm.id)
        } else {
            success = await deleteProduct(deleteConfirm.id)
        }

        if (success) {
            setDeleteConfirm(null)
            fetchSellerListings(currentPage, 10)
            if (user?.userId) {
                fetchAdminProducts(user.userId, adminCurrentPage, 10)
            }
        }
    }

    const handlePageChange = (newPage: number) => {
        if (selectedCategory === 'own') {
            setCurrentPage(newPage)
        } else {
            setAdminCurrentPage(newPage)
        }
    }

    useEffect(() => {
        if (selectedCategory !== 'own') return

        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchListings(searchQuery.trim(), currentPage, 10)
            } else {
                fetchSellerListings(currentPage, 10)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery, selectedCategory])

    useEffect(() => {
        if (selectedCategory !== 'admin' || !user?.userId) return

        const timer = setTimeout(() => {
            if (adminSearchQuery.trim()) {
                searchAdminProducts(user.userId, adminSearchQuery.trim(), adminCurrentPage, 10)
            } else {
                fetchAdminProducts(user.userId, adminCurrentPage, 10)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [adminSearchQuery, selectedCategory])

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    const handleClearAdminSearch = () => {
        setAdminSearchQuery('')
    }

    const openPriceModal = (data: PriceModalData) => {
        setPriceModal(data)
        setPriceFormData({
            price: data.currentPrice?.toString() || '',
            salePrice: data.currentSalePrice?.toString() || '',
            stock: data.currentStock?.toString() || '',
            deliveryDays: data.currentDeliveryDays?.toString() || '3',
        })
    }

    const closePriceModal = () => {
        setPriceModal(null)
        setPriceFormData({
            price: '',
            salePrice: '',
            stock: '',
            deliveryDays: '3',
        })
    }

    const handlePriceSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!priceModal) return

        const price = parseFloat(priceFormData.price)
        const salePrice = priceFormData.salePrice ? parseFloat(priceFormData.salePrice) : undefined
        const stock = parseInt(priceFormData.stock)
        const deliveryDays = parseInt(priceFormData.deliveryDays)

        if (isNaN(price) || isNaN(stock) || isNaN(deliveryDays)) {
            return
        }

        if (priceModal.type === 'create' && priceModal.productId) {
            const result = await createListing({
                productId: priceModal.productId,
                price,
                salePrice,
                stock,
                deliveryDays,
            })
            if (result) {
                closePriceModal()
                fetchSellerListings(currentPage, 10)
                if (user?.userId) {
                    fetchAdminProducts(user.userId, adminCurrentPage, 10)
                }
            }
        } else if (priceModal.type === 'update' && priceModal.listingId) {
            const result = await updateListing(priceModal.listingId, {
                price,
                salePrice,
                stock,
                deliveryDays,
            })
            if (result) {
                closePriceModal()
                fetchSellerListings(currentPage, 10)
                if (user?.userId) {
                    fetchAdminProducts(user.userId, adminCurrentPage, 10)
                }
            }
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
            <Breadcrumb pageName="Products" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-3">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon icon="mdi:filter-variant" width={20} height={20} className="text-primary" />
                                        </div>
                                        Filter Products
                                    </h2>
                                    <p className="text-xs text-gray-500">Browse by category</p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setSelectedCategory('own')}
                                        className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${selectedCategory === 'own'
                                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg scale-105'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102'
                                            }`}>
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedCategory === 'own' ? 'bg-white/20' : 'bg-white'
                                                    }`}>
                                                    <Icon icon="mdi:storefront" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">My Listings</span>
                                                    <span className="text-xs opacity-80">Your products</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${selectedCategory === 'own'
                                                ? 'bg-white/25 text-white'
                                                : 'bg-primary/10 text-primary'
                                                }`}>
                                                {totalListings}
                                            </span>
                                        </div>
                                        {selectedCategory === 'own' && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('admin')}
                                        className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${selectedCategory === 'admin'
                                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg scale-105'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102'
                                            }`}>
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedCategory === 'admin' ? 'bg-white/20' : 'bg-white'
                                                    }`}>
                                                    <Icon icon="mdi:shield-crown" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">All Products</span>
                                                    <span className="text-xs opacity-80">System products</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${selectedCategory === 'admin'
                                                ? 'bg-white/25 text-white'
                                                : 'bg-primary/10 text-primary'
                                                }`}>
                                                {adminTotalProducts}
                                            </span>
                                        </div>
                                        {selectedCategory === 'admin' && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                                        )}
                                    </button>
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
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-9">
                            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                                <div className="mb-6">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-12 md:col-span-3">
                                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                                                {selectedCategory === 'own' ? 'My Listings' : 'All Products'}
                                            </h1>
                                            <div className="flex items-center gap-3">
                                                {/* <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                    <Icon icon="mdi:cube-outline" width={16} height={16} className="text-primary" />
                                                    <span className="font-semibold text-primary">{displayedProducts.length}</span>
                                                    {displayedProducts.length === 1 ? 'product' : 'products'}
                                                </p> */}
                                                {selectedCategory === 'own' && displayedProducts.length > 0 && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                        <Icon icon="mdi:check-decagram" width={16} height={16} className="text-green-600" />
                                                        <span className="font-semibold text-green-600">
                                                            {displayedProducts.filter(p => p.approvalStatus === 'approved').length}
                                                        </span>
                                                        approved
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-6">
                                            <div className="relative">
                                                <Icon icon="mdi:magnify" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={selectedCategory === 'own' ? searchQuery : adminSearchQuery}
                                                    onChange={(e) => selectedCategory === 'own' ? setSearchQuery(e.target.value) : setAdminSearchQuery(e.target.value)}
                                                    placeholder="Search by product name or ID..."
                                                    className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {(selectedCategory === 'own' ? searchQuery : adminSearchQuery) && (
                                                    <button
                                                        type="button"
                                                        onClick={selectedCategory === 'own' ? handleClearSearch : handleClearAdminSearch}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all">
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-3 flex justify-end">
                                            <Link
                                                href="/products/add"
                                                className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-semibold">
                                                <Icon icon="mdi:plus-circle" width={18} height={18} />
                                                <span>Add Product</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <ProductTableSkeleton />
                                ) : displayedProducts.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                                            <Icon
                                                icon={selectedCategory === 'own' ? "mdi:package-variant-closed" : "mdi:shield-off"}
                                                className="text-gray-400"
                                                width={48}
                                                height={48}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {selectedCategory === 'own' ? 'No Products Yet' : 'No Admin Products Available'}
                                        </h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            {selectedCategory === 'own'
                                                ? 'You haven\'t added any products yet. Browse admin products and add your price to start selling!'
                                                : 'There are currently no admin products available. Check back later for new products to sell.'}
                                        </p>
                                        {selectedCategory === 'own' && (
                                            <button
                                                onClick={() => setSelectedCategory('admin')}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-3.5 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold">
                                                <Icon icon="mdi:eye" width={22} height={22} />
                                                Browse Admin Products
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-2.5 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon icon="mdi:shopping" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Product</span>
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon icon="mdi:tag" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Category</span>
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon icon="mdi:currency-inr" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Price</span>
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon icon="mdi:package-variant" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Stock</span>
                                                            </div>
                                                        </th>
                                                        {selectedCategory !== 'own' && (
                                                            <th className="px-4 py-2.5 text-left">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Icon icon="mdi:toggle-switch" width={16} height={16} className="text-primary" />
                                                                    <span className="text-xs font-semibold text-gray-700">Status</span>
                                                                </div>
                                                            </th>
                                                        )}
                                                        {selectedCategory === 'own' && (
                                                            <th className="px-4 py-2.5 text-left">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Icon icon="mdi:check-decagram" width={16} height={16} className="text-primary" />
                                                                    <span className="text-xs font-semibold text-gray-700">Approval</span>
                                                                </div>
                                                            </th>
                                                        )}
                                                        <th className="px-4 py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Icon icon="mdi:cog" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Actions</span>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {displayedProducts.map((product: any) => {
                                                        const isListing = selectedCategory === 'own'
                                                        const images = isListing ? product.productImages : product.images
                                                        const productName = product.productName
                                                        const price = product.price
                                                        const stock = product.stock || 0
                                                        const description = isListing ? product.productDescription : product.shortDescription

                                                        return (
                                                            <tr key={product._id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200">
                                                                <td className="px-4 py-2.5">
                                                                    <div className="flex items-center gap-3">
                                                                        {images && images.length > 0 ? (
                                                                            <div className="relative flex-shrink-0">
                                                                                <img
                                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${images[0]}`}
                                                                                    alt={productName}
                                                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                                                />
                                                                                {images.length > 1 && (
                                                                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                                                        +{images.length - 1}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                                <Icon icon="mdi:image-off" className="text-gray-400" width={24} height={24} />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-[150px]">
                                                                            <p className="text-black text-sm font-medium line-clamp-2" title={productName}>
                                                                                {productName}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <div className="text-xs text-gray-600">
                                                                        <p className="text-black text-sm font-medium">{product.mainCategoryName || '-'}</p>
                                                                        <p>{product.subCategoryName || '-'}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <div className="space-y-0.5">
                                                                        {product.salePrice && product.salePrice > 0 ? (
                                                                            <>
                                                                                <p className="text-base font-bold text-primary">
                                                                                    ₹{Number(product.salePrice).toLocaleString('en-IN')}
                                                                                </p>
                                                                                {product.price && product.price > 0 && (
                                                                                    <p className="text-[10px] text-gray-500 line-through">
                                                                                        ₹{Number(product.price).toLocaleString('en-IN')}
                                                                                    </p>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <p className="text-base font-bold text-primary">
                                                                                {product.price && product.price > 0 ? `₹${Number(product.price).toLocaleString('en-IN')}` : '-'}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs ${stock > 10
                                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                                        : stock > 0
                                                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                                        }`}>
                                                                        <Icon icon="mdi:package-variant" width={14} height={14} />
                                                                        <span>{stock}</span>
                                                                    </div>
                                                                </td>
                                                                {selectedCategory !== 'own' && (
                                                                    <td className="px-4 py-2.5">
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${(isListing ? product.sellerStatus === 'active' : product.status)
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                                            }`}>
                                                                            <Icon
                                                                                icon={(isListing ? product.sellerStatus === 'active' : product.status) ? 'mdi:check-circle' : 'mdi:close-circle'}
                                                                                width={14}
                                                                                height={14}
                                                                            />
                                                                            {(isListing ? product.sellerStatus === 'active' : product.status) ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {selectedCategory === 'own' && (
                                                                    <td className="px-4 py-2.5">
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${product.approvalStatus === 'approved'
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                            }`}>
                                                                            <Icon
                                                                                icon={product.approvalStatus === 'approved' ? 'mdi:check-decagram' : 'mdi:clock-outline'}
                                                                                width={14}
                                                                                height={14}
                                                                            />
                                                                            {product.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                <td className="px-4 py-2.5">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        {isListing ? (
                                                                            <>
                                                                                <Link
                                                                                    href={`/products/view/${product.productId}`}
                                                                                    className="group relative p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-200"
                                                                                    title="View Product">
                                                                                    <Icon icon="mdi:eye" width={16} height={16} />
                                                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                        View
                                                                                    </span>
                                                                                </Link>
                                                                                {(user?.userId === product.userId &&
                                                                                    <Link
                                                                                        href={`/products/edit/${product.productId}`}
                                                                                        className="group relative p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-all border border-transparent hover:border-purple-200"
                                                                                        title="Edit Product">
                                                                                        <Icon icon="mdi:pencil" width={16} height={16} />
                                                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                            Edit Product
                                                                                        </span>
                                                                                    </Link>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => openPriceModal({
                                                                                        type: 'update',
                                                                                        listingId: product.sellerProductId,
                                                                                        productName: productName,
                                                                                        currentPrice: product.price,
                                                                                        currentSalePrice: product.salePrice,
                                                                                        currentStock: product.stock,
                                                                                        currentDeliveryDays: product.deliveryDays,
                                                                                        commissionPercentage: product.commissionPercentage || 0,
                                                                                    })}
                                                                                    className="group relative p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-all border border-transparent hover:border-green-200"
                                                                                    title="Edit Price">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Icon icon="mdi:currency-usd" width={16} height={16} />
                                                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                            Edit Price
                                                                                        </span>
                                                                                    </div>
                                                                                </button>
                                                                                {/* <button
                                                                                    onClick={() => setDeleteConfirm({ id: product.sellerProductId, type: 'listing' })}
                                                                                    className="group relative p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-200"
                                                                                    title="Delete Listing">
                                                                                    <Icon icon="mdi:delete" width={16} height={16} />
                                                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                        Delete Listing
                                                                                    </span>
                                                                                </button> */}
                                                                            </>
                                                                        ) : (() => {
                                                                            const existingListingId = listingsMap.get(product.productId)
                                                                            const hasListing = product.isMyProduct || existingListingId

                                                                            if (hasListing) {
                                                                                const listingToUpdate = listings.find(l => l.productId === product.productId)
                                                                                return (
                                                                                    <>
                                                                                        <Link
                                                                                            href={`/products/view/${product.productId}`}
                                                                                            className="group relative p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-200"
                                                                                            title="View Product">
                                                                                            <Icon icon="mdi:eye" width={16} height={16} />
                                                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                                View
                                                                                            </span>
                                                                                        </Link>
                                                                                        {/* <button
                                                                                            onClick={() => openPriceModal({
                                                                                                type: 'update',
                                                                                                listingId: existingListingId,
                                                                                                productName: productName,
                                                                                                currentPrice: listingToUpdate?.price || product.price,
                                                                                                currentSalePrice: listingToUpdate?.salePrice || product.salePrice,
                                                                                                currentStock: listingToUpdate?.stock || product.stock,
                                                                                                currentDeliveryDays: listingToUpdate?.deliveryDays || 3,
                                                                                            })}
                                                                                            className="group relative px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                                                                                            title="Update Price">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Icon icon="mdi:currency-usd" width={18} height={18} />
                                                                                                <span className="text-sm">Update Price</span>
                                                                                            </div>
                                                                                        </button> */}
                                                                                        <button
                                                                                            onClick={() => openPriceModal({
                                                                                                type: 'update',
                                                                                                listingId: existingListingId,
                                                                                                productName: productName,
                                                                                                currentPrice: listingToUpdate?.price || product.price,
                                                                                                currentSalePrice: listingToUpdate?.salePrice || product.salePrice,
                                                                                                currentStock: listingToUpdate?.stock || product.stock,
                                                                                                currentDeliveryDays: listingToUpdate?.deliveryDays || 3,
                                                                                                commissionPercentage: listingToUpdate?.commissionPercentage || product.commissionPercentage || 0,
                                                                                            })}
                                                                                            className="group relative p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-all border border-transparent hover:border-green-200"
                                                                                            title="Edit Price">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Icon icon="mdi:currency-usd" width={16} height={16} />
                                                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                                    Update Price
                                                                                                </span>
                                                                                            </div>
                                                                                        </button>
                                                                                    </>
                                                                                )
                                                                            }

                                                                            return (
                                                                                <>
                                                                                    <Link
                                                                                        href={`/products/view/${product.productId}`}
                                                                                        className="group relative p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-200"
                                                                                        title="View Product">
                                                                                        <Icon icon="mdi:eye" width={16} height={16} />
                                                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                            View
                                                                                        </span>
                                                                                    </Link>
                                                                                    {/* <button
                                                                                        onClick={() => openPriceModal({
                                                                                            type: 'create',
                                                                                            productId: product.productId,
                                                                                            productName: productName,
                                                                                        })}
                                                                                        className="group relative px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                                                                                        title="Add Price">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Icon icon="mdi:plus-circle" width={18} height={18} />
                                                                                            <span className="text-sm">Add Price</span>
                                                                                        </div>
                                                                                    </button> */}
                                                                                    <button
                                                                                        onClick={() => openPriceModal({
                                                                                            type: 'create',
                                                                                            productId: product.productId,
                                                                                            productName: productName,
                                                                                            commissionPercentage: product.commissionPercentage || 0,
                                                                                        })}
                                                                                        className="group relative p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-all border border-transparent hover:border-purple-200"
                                                                                        title="Edit Price">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Icon icon="mdi:currency-usd" width={16} height={16} />
                                                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                                                Add Price
                                                                                            </span>
                                                                                        </div>
                                                                                    </button>
                                                                                </>
                                                                            )
                                                                        })()}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {displayedTotalPages > 1 && (
                                            <div className="mt-8">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-600">
                                                        Showing {displayedProducts.length} of {displayedTotalProducts} results
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePageChange(Math.max(1, displayedCurrentPage - 1))}
                                                            disabled={displayedCurrentPage === 1}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                            <Icon icon="mdi:chevron-left" width={20} height={20} />
                                                            Previous
                                                        </button>

                                                        <div className="flex gap-2">
                                                            {[...Array(Math.min(5, displayedTotalPages))].map((_, index) => {
                                                                let pageNum
                                                                if (displayedTotalPages <= 5) {
                                                                    pageNum = index + 1
                                                                } else if (displayedCurrentPage <= 3) {
                                                                    pageNum = index + 1
                                                                } else if (displayedCurrentPage >= displayedTotalPages - 2) {
                                                                    pageNum = displayedTotalPages - 4 + index
                                                                } else {
                                                                    pageNum = displayedCurrentPage - 2 + index
                                                                }

                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => handlePageChange(pageNum)}
                                                                        className={`w-10 h-10 rounded-lg font-medium transition ${displayedCurrentPage === pageNum
                                                                            ? 'bg-primary text-white'
                                                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                            }`}>
                                                                        {pageNum}
                                                                    </button>
                                                                )
                                                            })}

                                                            {displayedTotalPages > 5 && displayedCurrentPage < displayedTotalPages - 2 && (
                                                                <>
                                                                    <span className="px-2 py-2 text-gray-500">...</span>
                                                                    <button
                                                                        onClick={() => handlePageChange(displayedTotalPages)}
                                                                        className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition">
                                                                        {displayedTotalPages}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => handlePageChange(Math.min(displayedTotalPages, displayedCurrentPage + 1))}
                                                            disabled={displayedCurrentPage === displayedTotalPages}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                            Next
                                                            <Icon icon="mdi:chevron-right" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon icon="mdi:alert-circle" className="text-red-500" width={32} height={32} />
                            <h2 className="text-2xl font-bold text-black">Confirm Delete</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this {deleteConfirm.type === 'listing' ? 'listing' : 'product'}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {priceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Icon icon="mdi:currency-usd" className="text-primary" width={28} height={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-black">
                                        {priceModal.type === 'create' ? 'Add Price' : 'Update Price'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">{priceModal.productName}</p>
                                </div>
                            </div>
                            <button
                                onClick={closePriceModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <Icon icon="mdi:close" width={24} height={24} />
                            </button>
                        </div>

                        <form onSubmit={handlePriceSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                        <input
                                            type="number"
                                            value={priceFormData.price}
                                            onChange={(e) => setPriceFormData({ ...priceFormData, price: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="0.00"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sale Price (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                        <input
                                            type="number"
                                            value={priceFormData.salePrice}
                                            onChange={(e) => setPriceFormData({ ...priceFormData, salePrice: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Stock <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Icon icon="mdi:package-variant" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width={20} height={20} />
                                        <input
                                            type="number"
                                            value={priceFormData.stock}
                                            onChange={(e) => setPriceFormData({ ...priceFormData, stock: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Delivery Days <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Icon icon="mdi:truck-delivery" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width={20} height={20} />
                                        <input
                                            type="number"
                                            value={priceFormData.deliveryDays}
                                            onChange={(e) => setPriceFormData({ ...priceFormData, deliveryDays: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="3"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {priceFormData.price && parseFloat(priceFormData.price) > 0 && priceModal.commissionPercentage && priceModal.commissionPercentage > 0 && (
                                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Icon icon="mdi:calculator" className="text-blue-600 mt-1 flex-shrink-0" width={24} height={24} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-blue-900 mb-3 text-lg">Platform Fees Breakdown</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-white/80 rounded-lg p-3">
                                                    <span className="text-blue-800 font-medium">Your Sale Price:</span>
                                                    <span className="font-bold text-blue-900 text-lg">₹{parseFloat(priceFormData.salePrice).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/80 rounded-lg p-3">
                                                    <span className="text-blue-800 font-medium">Platform Fees ({priceModal.commissionPercentage}%):</span>
                                                    <span className="font-bold text-orange-600 text-lg">-₹{(parseFloat(priceFormData.salePrice) * priceModal.commissionPercentage / 100).toFixed(2)}</span>
                                                </div>
                                                <div className="border-t-2 border-blue-300 my-2"></div>
                                                <div className="flex justify-between items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
                                                    <span className="font-bold text-green-900 text-lg">You will receive:</span>
                                                    <span className="font-bold text-green-700 text-2xl">₹{(parseFloat(priceFormData.salePrice) * (100 - priceModal.commissionPercentage) / 100).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <Icon icon="mdi:information" className="text-blue-600 flex-shrink-0 mt-0.5" width={20} height={20} />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">Pricing Tips</p>
                                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                                            <li>Set a competitive price to attract more customers</li>
                                            <li>Use sale price for promotional offers</li>
                                            <li>Ensure sufficient stock to avoid order cancellations</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={closePriceModal}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader />
                                            <span>{priceModal.type === 'create' ? 'Adding...' : 'Updating...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:check-circle" width={20} height={20} />
                                            <span>{priceModal.type === 'create' ? 'Add Price' : 'Update Price'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
