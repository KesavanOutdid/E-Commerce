'use client'
import { useState } from 'react'
import { productService } from '@/services/productService'
import toast from 'react-hot-toast'

export const useProducts = () => {
    const [loading, setLoading] = useState(false)
    const [listings, setListings] = useState<any[]>([])
    const [adminProducts, setAdminProducts] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalListings, setTotalListings] = useState(0)
    const [adminTotalPages, setAdminTotalPages] = useState(0)
    const [adminTotalProducts, setAdminTotalProducts] = useState(0)

    const fetchSellerListings = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await productService.getSellerListings(page, limit)
            if (response.success) {
                const listingsList = response.data.listings || []
                const pagination = response.data.pagination || {}
                
                setListings(listingsList)
                setTotalPages(pagination.pages || 1)
                setTotalListings(pagination.total || listingsList.length)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch listings')
                return null
            }
        } catch (error: any) {
            console.error('Fetch listings error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch listings')
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchProductById = async (productId: string) => {
        setLoading(true)
        try {
            const response = await productService.getProductById(productId)
            if (response.success) {
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch product')
                return null
            }
        } catch (error: any) {
            console.error('Fetch product error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch product')
            return null
        } finally {
            setLoading(false)
        }
    }

    const createProduct = async (formData: FormData) => {
        setLoading(true)
        try {
            const response = await productService.createProduct(formData)
            if (response.success) {
                toast.success('Product created successfully')
                return response.data
            } else {
                toast.error(response.message || 'Failed to create product')
                return null
            }
        } catch (error: any) {
            console.error('Create product error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to create product')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateProduct = async (productId: string, formData: FormData) => {
        setLoading(true)
        try {
            const response = await productService.updateProduct(productId, formData)
            if (response.success) {
                toast.success('Product updated successfully')
                return response.data
            } else {
                toast.error(response.message || 'Failed to update product')
                return null
            }
        } catch (error: any) {
            console.error('Update product error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to update product')
            return null
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (productId: string) => {
        setLoading(true)
        try {
            const response = await productService.deleteProduct(productId)
            if (response.success) {
                toast.success('Product deleted successfully')
                return true
            } else {
                toast.error(response.message || 'Failed to delete product')
                return false
            }
        } catch (error: any) {
            console.error('Delete product error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to delete product')
            return false
        } finally {
            setLoading(false)
        }
    }

    const fetchAdminProducts = async (userId: string, page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await productService.getAdminProducts(userId, page, limit)
            if (response.success) {
                const productsList = response.data.products || []
                const pagination = response.data.pagination || {}
                
                setAdminProducts(productsList)
                setAdminTotalPages(pagination.pages || 1)
                setAdminTotalProducts(pagination.total || productsList.length)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch admin products')
                return null
            }
        } catch (error: any) {
            console.error('Fetch admin products error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch admin products')
            return null
        } finally {
            setLoading(false)
        }
    }

    const createListing = async (data: { productId: string; price: number; salePrice?: number; stock: number; deliveryDays: number }) => {
        setLoading(true)
        try {
            const response = await productService.createListing(data)
            if (response.success) {
                toast.success('Listing created successfully')
                return response.data
            } else {
                toast.error(response.message || 'Failed to create listing')
                return null
            }
        } catch (error: any) {
            console.error('Create listing error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to create listing')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateListing = async (listingId: string, data: { price?: number; salePrice?: number; stock?: number; deliveryDays?: number; sellerStatus?: string }) => {
        setLoading(true)
        try {
            const response = await productService.updateListing(listingId, data)
            if (response.success) {
                toast.success('Listing updated successfully')
                return response.data
            } else {
                toast.error(response.message || 'Failed to update listing')
                return null
            }
        } catch (error: any) {
            console.error('Update listing error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to update listing')
            return null
        } finally {
            setLoading(false)
        }
    }

    const deleteListing = async (listingId: string) => {
        setLoading(true)
        try {
            const response = await productService.deleteListing(listingId)
            if (response.success) {
                toast.success('Listing deleted successfully')
                return true
            } else {
                toast.error(response.message || 'Failed to delete listing')
                return false
            }
        } catch (error: any) {
            console.error('Delete listing error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to delete listing')
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        listings,
        adminProducts,
        totalPages,
        totalListings,
        adminTotalPages,
        adminTotalProducts,
        fetchSellerListings,
        fetchAdminProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        createListing,
        updateListing,
        deleteListing,
    }
}
