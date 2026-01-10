'use client'
import { useState } from 'react'
import { productService } from '@/services/productService'
import toast from 'react-hot-toast'

export const useProducts = () => {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)

    const fetchProducts = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await productService.getProducts(page, limit)
            if (response.success) {
                const productsList = response.data.products || []
                const pagination = response.data.pagination || {}
                
                setProducts(productsList)
                setTotalPages(pagination.pages || 1)
                setTotalProducts(pagination.total || productsList.length)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch products')
                return null
            }
        } catch (error: any) {
            console.error('Fetch products error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch products')
            return null
        } finally {
            setLoading(false)
        }
    }

    const searchProducts = async (search: string, page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            const response = await productService.searchProducts(search, page, limit)
            if (response.success) {
                const productsList = response.data.products || []
                const pagination = response.data.pagination || {}
                
                setProducts(productsList)
                setTotalPages(pagination.pages || 1)
                setTotalProducts(pagination.total || productsList.length)
                return response.data
            } else {
                toast.error(response.message || 'Failed to search products')
                return null
            }
        } catch (error: any) {
            console.error('Search products error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to search products')
            return null
        } finally {
            setLoading(false)
        }
    }

    const fetchProductById = async (id: string) => {
        setLoading(true)
        try {
            const response = await productService.getProductById(id)
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
                toast.success(response.message || 'Product created successfully')
                return response.data || true
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

    const addVariant = async (masterProductId: string, formData: FormData) => {
        setLoading(true)
        try {
            const response = await productService.addVariant(masterProductId, formData)
            if (response.success) {
                toast.success(response.message || 'Variant added successfully')
                return response.data || true
            } else {
                toast.error(response.message || 'Failed to add variant')
                return null
            }
        } catch (error: any) {
            console.error('Add variant error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to add variant')
            return null
        } finally {
            setLoading(false)
        }
    }

    const updateProduct = async (id: string, formData: FormData) => {
        setLoading(true)
        try {
            const response = await productService.updateProduct(id, formData)
            if (response.success) {
                toast.success(response.message || 'Product updated successfully')
                return response.data || true
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

    const deleteProduct = async (id: string) => {
        setLoading(true)
        try {
            const response = await productService.deleteProduct(id)
            if (response.success) {
                toast.success(response.message || 'Product deleted successfully')
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

    const checkProductBySlug = async (productName: string) => {
        try {
            const response = await productService.checkProductBySlug(productName)
            return response
        } catch (error: any) {
            console.error('Check product slug error:', error)
            return null
        }
    }

    return {
        loading,
        products,
        totalPages,
        totalProducts,
        fetchProducts,
        searchProducts,
        fetchProductById,
        createProduct,
        addVariant,
        updateProduct,
        deleteProduct,
        checkProductBySlug,
    }
}
