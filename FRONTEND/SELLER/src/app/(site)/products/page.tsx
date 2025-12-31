'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

export default function ProductsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { products, loading, totalPages, totalProducts, fetchProducts, deleteProduct } = useProducts()
    const hasFetchedProducts = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        if (isLoading) return
        
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedProducts.current && user?.userId) {
            fetchProducts(user.userId, currentPage, 10)
            hasFetchedProducts.current = true
        }
    }, [isAuthenticated, isLoading, router, user])

    useEffect(() => {
        if (user?.userId && hasFetchedProducts.current) {
            fetchProducts(user.userId, currentPage, 10)
        }
    }, [currentPage])

    const handleDelete = async (productId: string) => {
        const success = await deleteProduct(productId)
        if (success && user?.userId) {
            setDeleteConfirm(null)
            fetchProducts(user.userId, currentPage, 10)
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
            <Breadcrumb pageName="My Products" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-black mb-2">My Products</h1>
                                <p className="text-gray-600">
                                    Total Products: {totalProducts}
                                </p>
                            </div>
                            <Link
                                href="/products/add"
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">
                                <Icon icon="mdi:plus" width={20} height={20} />
                                Add Product
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <Icon icon="mdi:package-variant" className="mx-auto text-gray-300 mb-4" width={64} height={64} />
                                <p className="text-gray-600 text-lg mb-4">No products found</p>
                                <Link
                                    href="/products/add"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:plus" width={20} height={20} />
                                    Add Your First Product
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {products.map((product: any) => (
                                                <tr key={product._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
                                                                    alt={product.productName}
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                    <Icon icon="mdi:image-off" className="text-gray-400" width={32} height={32} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-black">{product.productName}</p>
                                                                <p className="text-sm text-gray-600">{product.productId}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-900">{product.mainCategoryName || 'N/A'}</p>
                                                        <p className="text-xs text-gray-600">{product.subCategoryName || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-black">₹{product.price}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {product.stock} units
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                            product.isActive
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            <Icon 
                                                                icon={product.isActive ? 'mdi:check-circle' : 'mdi:close-circle'} 
                                                                width={14} 
                                                                height={14} 
                                                            />
                                                            {product.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/products/view/${product.productId}`}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                title="View">
                                                                <Icon icon="mdi:eye" width={20} height={20} />
                                                            </Link>
                                                            <Link
                                                                href={`/products/edit/${product.productId}`}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit">
                                                                <Icon icon="mdi:pencil" width={20} height={20} />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteConfirm(product.productId)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete">
                                                                <Icon icon="mdi:delete" width={20} height={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                Showing {products.length} of {totalProducts} results
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                                                    <Icon icon="mdi:chevron-left" width={20} height={20} />
                                                    Previous
                                                </button>
                                                
                                                <div className="flex gap-2">
                                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                                        let pageNum
                                                        if (totalPages <= 5) {
                                                            pageNum = index + 1
                                                        } else if (currentPage <= 3) {
                                                            pageNum = index + 1
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + index
                                                        } else {
                                                            pageNum = currentPage - 2 + index
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={index}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`w-10 h-10 rounded-lg font-medium transition ${
                                                                    currentPage === pageNum
                                                                        ? 'bg-primary text-white'
                                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}>
                                                                {pageNum}
                                                            </button>
                                                        )
                                                    })}
                                                    
                                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                                        <>
                                                            <span className="px-2 py-2 text-gray-500">...</span>
                                                            <button
                                                                onClick={() => setCurrentPage(totalPages)}
                                                                className="w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition">
                                                                {totalPages}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
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
            </section>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon icon="mdi:alert-circle" className="text-red-500" width={32} height={32} />
                            <h2 className="text-2xl font-bold text-black">Confirm Delete</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={loading}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
