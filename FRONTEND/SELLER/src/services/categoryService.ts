import axios from '@/lib/axios'

export const categoryService = {
    getMainCategories: async () => {
        const response = await axios.get('/api/categories/main')
        return response.data
    },

    getSubCategories: async (mainCategoryId: string) => {
        const response = await axios.get(`/api/categories/sub/${mainCategoryId}`)
        return response.data
    },

    getSubCategoryById: async (subCategoryId: string) => {
        const response = await axios.get(`/api/categories/subcategory/${subCategoryId}`)
        return response.data
    },
}
