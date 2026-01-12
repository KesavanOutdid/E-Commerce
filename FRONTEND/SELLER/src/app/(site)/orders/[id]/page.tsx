'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import OrderViewSkeleton from '@/app/components/Skeleton/OrderView'

export default function OrderDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const { loading, fetchOrderById } = useOrders()
    const [order, setOrder] = useState<any>(null)

    useEffect(() => {
        if (authLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const loadOrder = async () => {
            if (params.id) {
                const orderData = await fetchOrderById(params.id as string)
                if (orderData) {
                    setOrder(orderData)
                }
            }
        }

        loadOrder()
    }, [isAuthenticated, authLoading, router, params.id])

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

    if (authLoading || loading) {
        return (
            <>
                <Breadcrumb pageName="Order Details" />
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="mb-6">
                            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                        <OrderViewSkeleton />
                    </div>
                </section>
            </>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center">
                    <Icon icon="mdi:alert-circle" className="mx-auto text-red-500 mb-4" width={60} height={60} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                    <Link href="/orders" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                        Back to Orders
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            <Breadcrumb pageName="Order Details" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="mb-6">
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition font-medium">
                            <Icon icon="mdi:arrow-left" width={20} height={20} />
                            Back to Orders
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order #{order.orderId}</h1>
                                        <p className="text-sm text-gray-500">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                                        <Icon icon="mdi:truck-delivery" width={16} height={16} />
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:package-variant" width={20} height={20} className="text-primary" />
                                        Order Items
                                    </h2>
                                    <div className="space-y-4">
                                        {order.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                                <div className="flex-shrink-0">
                                                    {item.images && item.images.length > 0 ? (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${item.images[0]}`}
                                                            alt={item.productName}
                                                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <Icon icon="mdi:image-off" className="text-gray-400" width={32} height={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Icon icon="mdi:package-variant" width={16} height={16} />
                                                            Qty: {item.qty}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Icon icon="mdi:currency-inr" width={16} height={16} />
                                                            ₹{Number(item.price).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary">
                                                        ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:map-marker" width={20} height={20} className="text-primary" />
                                    Delivery Address
                                </h2>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="font-semibold text-gray-900 mb-1">{order.deliveryAddress?.name}</p>
                                    <p className="text-sm text-gray-600">{order.deliveryAddress?.phone}</p>
                                    <p className="text-sm text-gray-600">{order.deliveryAddress?.email}</p>
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            {order.deliveryAddress?.doorNo}, {order.deliveryAddress?.street}
                                            {order.deliveryAddress?.landmark && `, ${order.deliveryAddress.landmark}`}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {order.deliveryAddress?.city}, {order.deliveryAddress?.district}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:credit-card" width={20} height={20} className="text-primary" />
                                    Payment Details
                                </h2>
                                <div className="space-y-3">
                                    {order.razorpayPaymentId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Payment ID</span>
                                            <span className="text-sm font-semibold text-gray-900 capitalize">{order.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Method</span>
                                        <span className="text-sm font-semibold text-gray-900 capitalize">{order.paymentType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Status</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:truck" width={20} height={20} className="text-primary" />
                                    Delivery Status
                                </h2>
                                <div className="space-y-3">
                                    {order.razorpayPaymentId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Payment ID</span>
                                            <span className="text-sm font-semibold text-gray-900 capitalize">{order.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Method</span>
                                        <span className="text-sm font-semibold text-gray-900 capitalize">{order.paymentType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Status</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div> */}

                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <Icon icon="mdi:information" className="text-blue-600 flex-shrink-0 mt-0.5" width={20} height={20} />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">Order Information</p>
                                        <p className="text-blue-800">
                                            This order was placed by {order.userEmail}. Please ensure timely processing and delivery.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
