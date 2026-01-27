'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { authService } from '@/services/authService'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import ProductTableSkeleton from '@/app/components/Skeleton/ProductTable'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProductsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const {
        products,
        loading,
        totalPages,
        totalProducts,
        fetchProducts,
        searchProducts,
        deleteProduct,
    } = useProducts()
    
    const hasFetchedProducts = useRef(false)
    const hasFetchedKYC = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [kycApproved, setKycApproved] = useState(false)
    const [kycLoading, setKycLoading] = useState(true)

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

        if (!hasFetchedProducts.current) {
            fetchProducts(currentPage, 10)
            hasFetchedProducts.current = true
        }
    }, [isAuthenticated, isLoading, router])

    const fetchKYCStatus = async () => {
        try {
            setKycLoading(true)
            const response = await authService.getKYCStatus()
            if (response.success) {
                setKycApproved(response.data.kycApproved || false)
            }
        } catch (error: any) {
            console.error('Error fetching KYC status:', error)
        } finally {
            setKycLoading(false)
        }
    }

    const handleAddProductClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!kycApproved) {
            e.preventDefault()
            toast.error('Please complete KYC verification to add products', {
                duration: 4000,
            })
        }
    }

    useEffect(() => {
        if (hasFetchedProducts.current) {
            if (searchQuery.trim()) {
                const timer = setTimeout(() => {
                    searchProducts(searchQuery.trim(), currentPage, 10)
                }, 500)
                return () => clearTimeout(timer)
            } else {
                fetchProducts(currentPage, 10)
            }
        }
    }, [searchQuery, currentPage])

    const handleDelete = async () => {
        if (!deleteConfirm) return

        const success = await deleteProduct(deleteConfirm.id)
        if (success) {
            setDeleteConfirm(null)
            fetchProducts(currentPage, 10)
        }
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        setCurrentPage(1)
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
                                    <div className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg">
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/20">
                                                    <Icon icon="mdi:storefront" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">My Products</span>
                                                    <span className="text-xs opacity-80">Your listings</span>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/25 text-white">
                                                {totalProducts}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                                    </div>
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
                                    <Link
                                        href="/promotions"
                                        className="w-full relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:shadow-md hover:scale-102">
                                        <div className="px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white">
                                                        <Icon icon="mdi:tag-multiple" width={20} height={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-semibold block">Promotions</span>
                                                        <span className="text-xs opacity-80">Offers & Coupons</span>
                                                    </div>
                                                </div>
                                                <Icon icon="mdi:chevron-right" width={20} height={20} />
                                            </div>
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
                                            <h1 className="text-2xl font-bold text-primary mb-1">
                                                My Products
                                            </h1>
                                        </div>

                                        <div className="col-span-12 md:col-span-6">
                                            <div className="relative">
                                                <Icon icon="mdi:magnify" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by product name or ID..."
                                                    className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={handleClearSearch}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                                                        <Icon icon="mdi:close" width={18} height={18} className="text-gray-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-12 md:col-span-3 flex justify-end">
                                            <Link
                                                href="/products/add"
                                                onClick={handleAddProductClick}
                                                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                                                    kycApproved 
                                                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg hover:scale-105' 
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}>
                                                <Icon icon="mdi:plus-circle" width={20} height={20} />
                                                Add Product
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {loading ? (
                                    <ProductTableSkeleton />
                                ) : products.length === 0 ? (
                                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-md mb-4">
                                            <Icon icon="mdi:package-variant-closed" className="text-gray-400" width={40} height={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            {searchQuery ? 'No products match your search. Try different keywords.' : 'You haven\'t added any products yet. Browse admin products and add your price to start selling!'}
                                        </p>
                                        {!searchQuery && (
                                            <Link
                                                href="/products/add"
                                                onClick={handleAddProductClick}
                                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                                                    kycApproved 
                                                        ? 'bg-primary text-white hover:bg-primary/90' 
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}>
                                                <Icon icon="mdi:plus-circle" width={20} height={20} />
                                                Add Your First Product
                                            </Link>
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
                                                                <Icon icon="mdi:format-list-numbered" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Variants</span>
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon icon="mdi:toggle-switch" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Status</span>
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Icon icon="mdi:cog" width={16} height={16} className="text-primary" />
                                                                <span className="text-xs font-semibold text-gray-700">Actions</span>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {products.map((product: any) => (
                                                        <tr key={product._id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200">
                                                            <td className="px-4 py-2.5">
                                                                <Link 
                                                                    href={`/products/view/${product.productId}`} 
                                                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                                                >
                                                                    {(() => {
                                                                        const firstVariantImage = product.variants?.[0]?.images?.[0]
                                                                        const totalImages = product.variants?.[0]?.images?.length || 0
                                                                        
                                                                        return firstVariantImage ? (
                                                                            <div className="relative flex-shrink-0">
                                                                                <img
                                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${firstVariantImage}`}
                                                                                    alt={product.productName}
                                                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                                                />
                                                                                {totalImages > 1 && (
                                                                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                                                        +{totalImages - 1}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                                <Icon icon="mdi:image-off" className="text-gray-400" width={24} height={24} />
                                                                            </div>
                                                                        )
                                                                    })()}
                                                                    <div className="flex-1 min-w-[150px]">
                                                                        <p className="text-black text-sm font-medium line-clamp-2" title={product.productName}>
                                                                            {product.productName}
                                                                        </p>
                                                                        {product.brand && (
                                                                            <p className="text-xs text-gray-500">{product.brand}</p>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="text-xs text-gray-600">
                                                                    <p className="text-black text-sm font-medium">{product.mainCategoryName || '-'}</p>
                                                                    <p>{product.subCategoryName || '-'}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                                                    <Icon icon="mdi:layers" width={14} height={14} />
                                                                    <span>{product.variantsCount || 0} variant{product.variantsCount !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${product.status
                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                                    }`}>
                                                                    <Icon
                                                                        icon={product.status ? 'mdi:check-circle' : 'mdi:close-circle'}
                                                                        width={14}
                                                                        height={14}
                                                                    />
                                                                    {product.status ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Link
                                                                        href={`/products/view/${product.productId}`}
                                                                        className="group relative p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                                        <Icon icon="mdi:eye" width={18} height={18} />
                                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                            View Product
                                                                        </span>
                                                                    </Link>
                                                                    <Link
                                                                        href={`/products/edit/${product.productId}`}
                                                                        className="group relative p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                        <Icon icon="mdi:pencil" width={18} height={18} />
                                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                            Edit Product
                                                                        </span>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => setDeleteConfirm({ id: product.productId, name: product.productName })}
                                                                        className="group relative p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                        <Icon icon="mdi:delete" width={18} height={18} />
                                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                            Delete Product
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                                <div className="text-sm text-gray-600">
                                                    Showing page {currentPage} of {totalPages} ({totalProducts} total products)
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                                                            }`}>
                                                        <Icon icon="mdi:chevron-left" width={20} height={20} className="inline" />
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                                                            }`}>
                                                        Next
                                                        <Icon icon="mdi:chevron-right" width={20} height={20} className="inline" />
                                                    </button>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Icon icon="mdi:alert-circle" className="text-red-600" width={28} height={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteConfirm.name}"</span>? 
                            This will also delete all its variants and cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Icon icon="mdi:loading" className="animate-spin" width={18} height={18} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:delete" width={18} height={18} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
