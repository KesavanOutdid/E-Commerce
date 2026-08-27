'use client'
import { useState } from 'react'
import { orderService } from '@/services/orderService'
import toast from 'react-hot-toast'

export const useOrders = () => {
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)

    const fetchSellerOrders = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await orderService.getSellerOrders(page, limit)
            if (response && response.success) {
                const ordersList = response.data || []
                const pagination = response.pagination || {}
                
                setOrders(ordersList)
                setTotalPages(pagination.pages || 1)
                setTotalOrders(pagination.total || ordersList.length)
                return response
            } else {
                setOrders([])
                setTotalPages(0)
                setTotalOrders(0)
                toast.error(response?.message || 'Failed to fetch orders')
                return null
            }
        } catch (error: any) {
            console.error('Fetch orders error:', error)
            setOrders([])
            setTotalPages(0)
            setTotalOrders(0)
            const message = error.response?.data?.message || error.message || 'Failed to fetch orders'
            if (error.response?.status !== 401) {
                toast.error(message)
            }
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchOrderById = async (orderId: string) => {
        setLoading(true)
        try {
            const response = await orderService.getOrderById(orderId)
            if (response && response.success) {
                return response.data
            } else {
                toast.error(response?.message || 'Failed to fetch order details')
                return null
            }
        } catch (error: any) {
            console.error('Fetch order error:', error)
            const message = error.response?.data?.message || error.message || 'Failed to fetch order details'
            if (error.response?.status !== 401) {
                toast.error(message)
            }
            return null
        } finally {
            setLoading(false)
        }
    }

    const searchOrders = async (search: string, page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await orderService.searchOrders(search, page, limit)
            if (response && response.success) {
                const ordersList = response.data || []
                const pagination = response.pagination || {}
                
                setOrders(ordersList)
                setTotalPages(pagination.pages || 1)
                setTotalOrders(pagination.total || ordersList.length)
                return response
            } else {
                setOrders([])
                setTotalPages(0)
                setTotalOrders(0)
                toast.error(response?.message || 'Failed to search orders')
                return null
            }
        } catch (error: any) {
            console.error('Search orders error:', error)
            setOrders([])
            setTotalPages(0)
            setTotalOrders(0)
            const message = error.response?.data?.message || error.message || 'Failed to search orders'
            if (error.response?.status !== 401) {
                toast.error(message)
            }
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        orders,
        totalPages,
        totalOrders,
        fetchSellerOrders,
        fetchOrderById,
        searchOrders,
    }
}
