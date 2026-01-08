'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import ProductFormSkeleton from '@/app/components/Skeleton/ProductForm'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading: productLoading, fetchProductById, updateProduct } = useProducts()
    const { loading: categoryLoading, mainCategories, subCategories, fetchMainCategories, fetchSubCategories } = useCategories()
    const hasFetchedData = useRef(false)
    
    const [formData, setFormData] = useState({
        productName: '',
        mainCategoryId: '',
        subCategoryId: '',
        description: '',
        shortDescription: '',
        price: '',
        stock: '',
        unitSize: '',
        unitWeight: '',
        attributes: [{ name: '', value: '' }],
    })
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
    const [originalData, setOriginalData] = useState<any>(null)

    useEffect(() => {
        if (isLoading) return
        
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedData.current) {
            const fetchData = async () => {
                await fetchMainCategories()
                const product = await fetchProductById(id)
                if (product) {
                    const initialData = {
                        productName: product.productName || '',
                        mainCategoryId: product.mainCategoryId || '',
                        subCategoryId: product.subCategoryId || '',
                        description: product.description || '',
                        shortDescription: product.shortDescription || '',
                        price: product.price?.toString() || '',
                        stock: product.stock?.toString() || '',
                        unitSize: product.unitSize || '',
                        unitWeight: product.unitWeight || '',
                        attributes: product.attributes && product.attributes.length > 0 
                            ? product.attributes 
                            : [{ name: '', value: '' }],
                    }
                    setFormData(initialData)
                    setOriginalData(initialData)
                    setExistingImages(product.images || [])
                    
                    if (product.mainCategoryId) {
                        await fetchSubCategories(product.mainCategoryId)
                    }
                }
            }
            fetchData()
            hasFetchedData.current = true
        }
    }, [isAuthenticated, isLoading, router, id])

    useEffect(() => {
        if (formData.mainCategoryId && formData.mainCategoryId !== originalData?.mainCategoryId) {
            fetchSubCategories(formData.mainCategoryId)
            setFormData(prev => ({ ...prev, subCategoryId: '' }))
        }
    }, [formData.mainCategoryId])

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setNewImages(files)
            
            const previews = files.map(file => URL.createObjectURL(file))
            setNewImagePreviews(previews)
        }
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { name: '', value: '' }]
        }))
    }

    const removeAttribute = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }))
    }

    const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, i) => 
                i === index ? { ...attr, [field]: value } : attr
            )
        }))
    }

    const hasFormChanged = () => {
        if (!originalData) return false
        
        return (
            formData.productName !== originalData.productName ||
            formData.mainCategoryId !== originalData.mainCategoryId ||
            formData.subCategoryId !== originalData.subCategoryId ||
            formData.description !== originalData.description ||
            formData.shortDescription !== originalData.shortDescription ||
            JSON.stringify(formData.attributes) !== JSON.stringify(originalData.attributes) ||
            newImages.length > 0
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!user?.userId) return

        const selectedSubCategory = subCategories.find((cat: any) => cat._id === formData.subCategoryId)
        const parentCategoryId = selectedSubCategory 
            ? (selectedSubCategory.categoryId || selectedSubCategory.parentId || selectedSubCategory.mainCategoryId || formData.mainCategoryId)
            : formData.mainCategoryId
        
        const productFormData = new FormData()
        productFormData.append('productName', formData.productName)
        
        if (formData.mainCategoryId !== originalData?.mainCategoryId || formData.subCategoryId !== originalData?.subCategoryId) {
            productFormData.append('mainCategoryId', parentCategoryId)
        }
        if (formData.subCategoryId !== originalData?.subCategoryId) {
            productFormData.append('subCategoryId', formData.subCategoryId)
        }
        if (formData.description !== originalData?.description) {
            productFormData.append('description', formData.description)
        }
        if (formData.shortDescription !== originalData?.shortDescription) {
            productFormData.append('shortDescription', formData.shortDescription)
        }
        
        const validAttributes = formData.attributes.filter(attr => attr.name && attr.value)
        if (JSON.stringify(validAttributes) !== JSON.stringify(originalData?.attributes)) {
            productFormData.append('attributes', JSON.stringify(validAttributes))
        }
        
        newImages.forEach((image) => {
            productFormData.append('images', image)
        })

        const result = await updateProduct(id, productFormData)
        if (result) {
            router.push('/products')
        }
    }

    if (isLoading) {
        return (
            <>
                <Breadcrumb pageName="Edit Product" />
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                    <div className="container mx-auto max-w-4xl px-4">
                        <ProductFormSkeleton />
                    </div>
                </section>
            </>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (!originalData || productLoading) {
        return (
            <>
                <Breadcrumb pageName="Edit Product" />
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                    <div className="container mx-auto max-w-4xl px-4">
                        <ProductFormSkeleton />
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <Breadcrumb pageName="Edit Product" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black mb-2">Edit Product</h1>
                            <p className="text-gray-600">
                                Update the product details
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:information" width={24} height={24} className="text-primary" />
                                    Basic Information
                                </h2>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Product Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.productName}
                                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Main Category <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.mainCategoryId}
                                                    onChange={(e) => setFormData({ ...formData, mainCategoryId: e.target.value })}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                    required
                                                    disabled={categoryLoading}>
                                                    <option value="">Select Main Category</option>
                                                    {mainCategories.map((category: any) => (
                                                        <option key={category._id} value={category.categoryId}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Sub Category <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.subCategoryId}
                                                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                    required
                                                    disabled={!formData.mainCategoryId || categoryLoading}>
                                                    <option value="">Select Sub Category</option>
                                                    {subCategories.map((category: any) => (
                                                        <option key={category._id} value={category.subCategoryId}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Short Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.shortDescription}
                                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                                rows={3}
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={5}
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="mb-6">
                                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:currency-usd" width={24} height={24} className="text-primary" />
                                    Pricing & Stock
                                </h2>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (₹) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                min="0"
                                                step="0.01"
                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600 cursor-not-allowed"
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                min="0"
                                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600 cursor-not-allowed"
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:tag-multiple" width={24} height={24} className="text-primary" />
                                    Product Attributes
                                </h2>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                                    {formData.attributes.map((attr, index) => (
                                        <div key={index} className="flex gap-4 mb-4">
                                            <input
                                                type="text"
                                                value={attr.name}
                                                onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                                placeholder="Attribute Name (e.g., RAM)"
                                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                            />
                                            <input
                                                type="text"
                                                value={attr.value}
                                                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                                placeholder="Value (e.g., 16GB)"
                                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                            />
                                            {formData.attributes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttribute(index)}
                                                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
                                                    <Icon icon="mdi:delete" width={20} height={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addAttribute}
                                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition">
                                        <Icon icon="mdi:plus-circle" width={20} height={20} />
                                        Add Attribute
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:image-multiple" width={24} height={24} className="text-primary" />
                                    Product Images
                                    <span className="text-sm font-normal text-gray-600">
                                        ({existingImages.length + newImages.length} total)
                                    </span>
                                </h2>
                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl">
                                    {existingImages.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Icon icon="mdi:image-check" width={18} height={18} />
                                                    Existing Images ({existingImages.length})
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Hover to remove
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {existingImages.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                                                            #{index + 1}
                                                        </div>
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                                                            alt={`Existing ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(index)}
                                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700 z-10">
                                                            <Icon icon="mdi:close" width={16} height={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Icon icon="mdi:plus-circle" width={18} height={18} />
                                            Add New Images
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleNewImageChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                        />
                                        {newImagePreviews.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3 mt-4">
                                                    <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                                                        <Icon icon="mdi:image-plus" width={18} height={18} />
                                                        New Images ({newImages.length})
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Hover to remove
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {newImagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                                                                New #{index + 1}
                                                            </div>
                                                            <img
                                                                src={preview}
                                                                alt={`New ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewImage(index)}
                                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700 z-10">
                                                                <Icon icon="mdi:close" width={16} height={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-8">
                                <Link
                                    href="/products"
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={productLoading || !hasFormChanged()}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {productLoading ? (
                                        <>
                                            <Loader />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:check" width={20} height={20} />
                                            Update Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}
