'use client'
import { useState } from 'react'
import { categoryService } from '@/services/categoryService'
import toast from 'react-hot-toast'

export const useCategories = () => {
    const [loading, setLoading] = useState(false)
    const [mainCategories, setMainCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])

    const fetchMainCategories = async () => {
        setLoading(true)
        try {
            const response = await categoryService.getMainCategories()
            if (response.success) {
                const categories = response.data.categories || []
                setMainCategories(categories)
                return categories
            } else {
                toast.error(response.message || 'Failed to fetch main categories')
                return []
            }
        } catch (error: any) {
            console.error('Fetch main categories error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch main categories')
            return []
        } finally {
            setLoading(false)
        }
    }

    const fetchSubCategories = async (mainCategoryId: string) => {
        setLoading(true)
        setSubCategories([])
        try {
            const response = await categoryService.getSubCategories(mainCategoryId)
            if (response.success) {
                setSubCategories(response.data)
                return response.data
            } else {
                toast.error(response.message || 'Failed to fetch sub categories')
                setSubCategories([])
                return []
            }
        } catch (error: any) {
            console.error('Fetch sub categories error:', error)
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch sub categories')
            setSubCategories([])
            return []
        } finally {
            setLoading(false)
        }
    }

    const fetchSubCategoryById = async (subCategoryId: string) => {
        setLoading(true)
        try {
            const response = await categoryService.getSubCategoryById(subCategoryId)
            if (response.success) {
                return response.data
            } else {
                return null
            }
        } catch (error: any) {
            console.error('Fetch sub category error:', error)
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        mainCategories,
        subCategories,
        fetchMainCategories,
        fetchSubCategories,
        fetchSubCategoryById,
    }
}
