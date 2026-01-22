'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import OrderTableSkeleton from '@/app/components/Skeleton/OrderTable'

export default function OrdersPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth()
    const { orders, loading, totalPages, totalOrders, fetchSellerOrders, searchOrders } = useOrders()
    const hasFetchedOrders = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedOrders.current) {
            fetchSellerOrders(currentPage, 10)
            hasFetchedOrders.current = true
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (hasFetchedOrders.current) {
            fetchSellerOrders(currentPage, 10)
        }
    }, [currentPage])

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    useEffect(() => {
        if (!hasFetchedOrders.current) return

        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchOrders(searchQuery.trim(), currentPage, 10)
            } else {
                fetchSellerOrders(currentPage, 10)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleClearSearch = () => {
        setSearchQuery('')
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200'
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'shipped':
            case 'processing':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'cancelled':
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'paid':
                return 'bg-green-50 text-green-700 border-green-200'
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
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
            <Breadcrumb pageName="Orders" />
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
                                    <div className="w-full group relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg">
                                        <div className="flex items-center justify-between gap-3 px-4 py-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/20">
                                                    <Icon icon="mdi:shopping" width={20} height={20} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-semibold block">Orders</span>
                                                    <span className="text-xs opacity-80">Manage orders</span>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/25 text-white">
                                                {totalOrders}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                                    </div>
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
                                        Orders
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                            <Icon icon="mdi:shopping" width={16} height={16} />
                                            <span className="py-0.5 text-primary text-xs font-semibold">
                                                ({totalOrders} total orders) Manage your customer orders
                                            </span>
                                            {/* <span>Manage your customer orders</span> */}
                                        </p>
                                        {/* <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                            {totalOrders} totalaas
                                        </span> */}
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <div className="relative">
                                        <Icon icon="mdi:magnify" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by order ID, product name, payment method, or status..."
                                            className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={handleClearSearch}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-3 flex justify-end">
                                    <Link
                                        href="/products"
                                        className="px-4 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold">
                                        <Icon icon="mdi:arrow-left" width={18} height={18} />
                                        Back to Products
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {loading && !orders.length ? (
                            <OrderTableSkeleton />
                        ) : orders.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="mb-4">
                                    <Icon icon="mdi:shopping-outline" className="mx-auto text-gray-300" width={80} height={80} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
                                <p className="text-gray-500">You haven't received any orders yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:shopping" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Product</span>
                                                    </div>
                                                </th>
                                                {/* <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:package-variant" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Order ID</span>
                                                    </div>
                                                </th>
                                                <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:account" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Customer</span>
                                                    </div>
                                                </th> */}
                                                {/* <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:cart" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Items</span>
                                                    </div>
                                                </th> */}
                                                {/* <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:currency-inr" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Total</span>
                                                    </div>
                                                </th> */}
                                                {/* <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:credit-card" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Payment Method</span>
                                                    </div>
                                                </th> */}
                                                <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:credit-card" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Payment Status</span>
                                                    </div>
                                                </th>
                                                <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:truck-delivery" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Status</span>
                                                    </div>
                                                </th>
                                                <th className="px-4 py-2.5 text-left">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon icon="mdi:calendar" width={16} height={16} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700">Date</span>
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
                                            {orders.map((order: any) => (
                                                <tr key={order._id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200">
                                                    <td className="px-4 py-2.5">
                                                        <Link href={`/orders/${order.orderId}`} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                                            {order.items && order.items.length > 0 && order.items[0].images && order.items[0].images.length > 0 ? (
                                                                <div className="relative flex-shrink-0">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${order.items[0].images[0]}`}
                                                                        alt={order.items[0].productName}
                                                                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                                    />
                                                                    {order.items.length > 1 && (
                                                                        <div className="absolute -bottom-1 -right-1 bg-primary text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                                            +{order.items.length - 1}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                                    <Icon icon="mdi:image-off" className="text-gray-400" width={24} height={24} />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-[150px]">
                                                                <p className="text-black text-sm font-medium line-clamp-2" title={order.items && order.items.length > 0 ? order.items[0].productName : 'N/A'}>
                                                                    {order.items && order.items.length > 0 ? order.items[0].productName : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    {/* <td className="px-4 py-2.5">
                                                        <span className="font-semibold text-primary text-sm">{order.orderId}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{order.deliveryAddress?.name || 'N/A'}</p>
                                                            <p className="text-[11px] text-gray-500">{order.userEmail}</p>
                                                        </div>
                                                    </td> */}
                                                    {/* <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                                            <Icon icon="mdi:package-variant" width={14} height={14} />
                                                            {order.items?.length || 0} item(s)
                                                        </span>
                                                    </td> */}
                                                    {/* <td className="px-4 py-2.5">
                                                        <p className="text-base font-bold text-primary">₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}</p>
                                                    </td> */}
                                                    {/* <td className="px-4 py-2.5">
                                                        <p className="text-[11px] text-gray-500 capitalize">{order.paymentType}</p>
                                                    </td> */}
                                                    <td className="px-4 py-2.5">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                            <Icon icon={order.paymentStatus === 'completed' ? 'mdi:check-circle' : 'mdi:clock-outline'} width={12} height={12} />
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusColor(order.orderStatus)}`}>
                                                            <Icon icon="mdi:truck-delivery" width={12} height={12} />
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <p className="text-xs text-gray-600">
                                                            {new Date(order.createdAt).toLocaleString('en-IN', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }).replace(',', ' at')}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center justify-center">
                                                            <Link
                                                                href={`/orders/${order.orderId}`}
                                                                className="group relative p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-200"
                                                                title="View Order">
                                                                <Icon icon="mdi:eye" width={16} height={16} />
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    View Details
                                                                </span>
                                                            </Link>
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
                                                Showing {orders.length} of {totalOrders} results
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium">
                                                    <Icon icon="mdi:chevron-left" width={20} height={20} />
                                                    Previous
                                                </button>
                                                <div className="flex gap-2">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === page
                                                                ? 'bg-primary text-white shadow-md'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                                }`}>
                                                            {page}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium">
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
        </>
    )
}

