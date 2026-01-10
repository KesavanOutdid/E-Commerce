'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { usePickupAddress } from '@/hooks/usePickupAddress'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import ProductFormSkeleton from '@/app/components/Skeleton/ProductForm'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Variant {
    variantId?: string
    price: string
    salePrice: string
    stock: string
    deliveryDays: string
    pickupAddress: string
    attributes: Array<{ name: string; value: string }>
    images: File[]
    existingImages: string[]
}

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading: productLoading, fetchProductById, updateProduct } = useProducts()
    const { loading: categoryLoading, mainCategories, subCategories, fetchMainCategories, fetchSubCategories } = useCategories()
    const { loading: pickupLoading, addresses: pickupAddresses, fetchAddresses } = usePickupAddress()
    const hasFetchedData = useRef(false)

    const [formData, setFormData] = useState({
        productName: '',
        mainCategoryId: '',
        subCategoryId: '',
        description: '',
        shortDescription: '',
        brand: '',
        warranty: '',
    })

    const [highlights, setHighlights] = useState<string[]>([])
    const [specifications, setSpecifications] = useState<Array<{ name: string; value: string }>>([])
    const [showHighlights, setShowHighlights] = useState(false)
    const [showSpecifications, setShowSpecifications] = useState(false)
    const [variants, setVariants] = useState<Variant[]>([])
    const [subCategoryAttributes, setSubCategoryAttributes] = useState<any[]>([])
    const [commissionPercentage, setCommissionPercentage] = useState<number>(0)
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
                await fetchAddresses()
                const productData = await fetchProductById(id)
                
                if (productData) {
                    const initialData = {
                        productName: productData.productName || '',
                        mainCategoryId: productData.mainCategoryId || '',
                        subCategoryId: productData.subCategoryId || '',
                        description: productData.description || '',
                        shortDescription: productData.shortDescription || '',
                        brand: productData.brand || '',
                        warranty: productData.warranty || '',
                    }
                    setFormData(initialData)
                    setOriginalData(productData)
                    
                    setHighlights(productData.highlights || [])
                    setShowHighlights((productData.highlights || []).length > 0)
                    
                    setSpecifications(productData.specifications || [])
                    setShowSpecifications((productData.specifications || []).length > 0)
                    
                    if (productData.mainCategoryId) {
                        await fetchSubCategories(productData.mainCategoryId)
                    }

                    if (productData.subCategoryId) {
                        const subCategory = await fetchSubCategoryDetails(productData.subCategoryId)
                        if (subCategory) {
                            setSubCategoryAttributes(subCategory.attributes || [])
                            setCommissionPercentage(subCategory.commissionPercentage || 0)
                        }
                    }

                    if (productData.variants && productData.variants.length > 0) {
                        const formattedVariants = productData.variants.map((v: any) => ({
                            variantId: v.variantId,
                            price: v.price?.toString() || '',
                            salePrice: v.salePrice?.toString() || '',
                            stock: v.stock?.toString() || '',
                            deliveryDays: v.deliveryDays?.toString() || '3',
                            pickupAddress: v.pickupAddress || '',
                            attributes: v.attributes || [],
                            images: [],
                            existingImages: v.images || []
                        }))
                        setVariants(formattedVariants)
                    }
                }
            }
            fetchData()
            hasFetchedData.current = true
        }
    }, [isAuthenticated, isLoading, router, id])

    const fetchSubCategoryDetails = async (subCategoryId: string) => {
        const subCategory = subCategories.find((cat: any) =>
            cat.subCategoryId === subCategoryId || cat._id === subCategoryId
        )
        return subCategory
    }

    useEffect(() => {
        if (formData.mainCategoryId && formData.mainCategoryId !== originalData?.mainCategoryId) {
            fetchSubCategories(formData.mainCategoryId)
            setFormData(prev => ({ ...prev, subCategoryId: '' }))
            setSubCategoryAttributes([])
        }
    }, [formData.mainCategoryId])

    useEffect(() => {
        const loadSubCategoryAttributes = async () => {
            if (formData.subCategoryId) {
                const subCategory = subCategories.find((cat: any) =>
                    cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId
                )
                if (subCategory && subCategory.attributes && subCategory.attributes.length > 0) {
                    setSubCategoryAttributes(subCategory.attributes)
                    setCommissionPercentage(subCategory.commissionPercentage || 0)
                }
            }
        }
        loadSubCategoryAttributes()
    }, [formData.subCategoryId, subCategories])

    const updateVariant = (index: number, field: keyof Variant, value: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        ))
    }

    const updateVariantAttribute = (variantIndex: number, attrIndex: number, value: string) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex ? {
                ...variant,
                attributes: variant.attributes.map((attr, j) =>
                    j === attrIndex ? { ...attr, value } : attr
                )
            } : variant
        ))
    }

    const handleVariantImageChange = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
            const invalidFiles = files.filter(file => !validTypes.includes(file.type))
            if (invalidFiles.length > 0) {
                toast.error('Only PNG, JPG, and JPEG files are allowed')
                return
            }
            setVariants(prev => prev.map((variant, i) =>
                i === variantIndex ? { ...variant, images: [...variant.images, ...files] } : variant
            ))
        }
    }

    const removeVariantImage = (variantIndex: number, imageIndex: number) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex ? { ...variant, images: variant.images.filter((_, idx) => idx !== imageIndex) } : variant
        ))
    }

    const removeVariantExistingImage = (variantIndex: number, imageIndex: number) => {
        setVariants(prev => prev.map((variant, i) =>
            i === variantIndex ? { ...variant, existingImages: variant.existingImages.filter((_, idx) => idx !== imageIndex) } : variant
        ))
    }

    const addHighlight = () => {
        setHighlights([...highlights, ''])
    }

    const removeHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index))
    }

    const updateHighlight = (index: number, value: string) => {
        setHighlights(prev => prev.map((h, i) => i === index ? value : h))
    }

    const addSpecification = () => {
        setSpecifications([...specifications, { name: '', value: '' }])
    }

    const removeSpecification = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index))
    }

    const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
        setSpecifications(prev => prev.map((spec, i) =>
            i === index ? { ...spec, [field]: value } : spec
        ))
    }

    const getVariantImagePreviews = (variantIndex: number) => {
        const variant = variants[variantIndex]
        return variant.images.map(file => URL.createObjectURL(file))
    }

    const isFormValid = () => {
        return (
            formData.productName.trim() !== '' &&
            formData.mainCategoryId !== '' &&
            formData.subCategoryId !== '' &&
            formData.description.trim() !== '' &&
            formData.shortDescription.trim() !== '' &&
            variants.every(v =>
                v.price.trim() !== '' &&
                v.stock.trim() !== '' &&
                v.attributes.every(a => a.value.trim() !== '') &&
                (v.images.length > 0 || v.existingImages.length > 0)
            )
        )
    }

    const hasFormChanged = () => {
        if (!originalData) return false

        if (
            formData.productName !== originalData.productName ||
            formData.mainCategoryId !== originalData.mainCategoryId ||
            formData.subCategoryId !== originalData.subCategoryId ||
            formData.description !== originalData.description ||
            formData.shortDescription !== originalData.shortDescription ||
            formData.brand !== (originalData.brand || '') ||
            formData.warranty !== (originalData.warranty || '')
        ) {
            return true
        }

        if (JSON.stringify(highlights) !== JSON.stringify(originalData.highlights || [])) {
            return true
        }

        if (JSON.stringify(specifications) !== JSON.stringify(originalData.specifications || [])) {
            return true
        }

        if (originalData.variants && originalData.variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const currentVariant = variants[i]
                const originalVariant = originalData.variants[i]

                if (!originalVariant) return true

                if (
                    currentVariant.price !== originalVariant.price?.toString() ||
                    currentVariant.salePrice !== (originalVariant.salePrice?.toString() || '') ||
                    currentVariant.stock !== originalVariant.stock?.toString() ||
                    currentVariant.deliveryDays !== (originalVariant.deliveryDays?.toString() || '3') ||
                    currentVariant.pickupAddress !== (originalVariant.pickupAddress || '')
                ) {
                    return true
                }

                if (JSON.stringify(currentVariant.attributes) !== JSON.stringify(originalVariant.attributes || [])) {
                    return true
                }

                if (currentVariant.images.length > 0) {
                    return true
                }

                if (JSON.stringify(currentVariant.existingImages) !== JSON.stringify(originalVariant.images || [])) {
                    return true
                }
            }
        }

        return false
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.userId) return

        const selectedSubCategory = subCategories.find((cat: any) =>
            cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId
        )
        if (!selectedSubCategory) {
            toast.error('Please select a valid sub-category')
            return
        }

        const parentCategoryId = selectedSubCategory.parentId || formData.mainCategoryId

        const productFormData = new FormData()
        productFormData.append('productName', formData.productName)
        productFormData.append('mainCategoryId', parentCategoryId)
        productFormData.append('subCategoryId', formData.subCategoryId)
        productFormData.append('description', formData.description)
        productFormData.append('shortDescription', formData.shortDescription)

        if (formData.brand) productFormData.append('brand', formData.brand)
        if (formData.warranty) productFormData.append('warranty', formData.warranty)

        const validHighlights = highlights.filter(h => h.trim() !== '')
        if (validHighlights.length > 0) {
            productFormData.append('highlights', JSON.stringify(validHighlights))
        }

        const validSpecifications = specifications.filter(s => s.name.trim() !== '' && s.value.trim() !== '')
        if (validSpecifications.length > 0) {
            productFormData.append('specifications', JSON.stringify(validSpecifications))
        }

        const variantsData = variants.map(variant => ({
            variantId: variant.variantId,
            price: parseFloat(variant.price),
            salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
            stock: parseInt(variant.stock),
            deliveryDays: parseInt(variant.deliveryDays) || 3,
            pickupAddress: variant.pickupAddress || null,
            attributes: variant.attributes.filter(attr => attr.value.trim() !== ''),
            existingImages: variant.existingImages
        }))

        productFormData.append('variants', JSON.stringify(variantsData))

        variants.forEach((variant, index) => {
            variant.images.forEach((image) => {
                productFormData.append(`variantImages_${index}`, image)
            })
        })

        const result = await updateProduct(id, productFormData)
        if (result) {
            router.push('/products')
        }
    }

    if (isLoading || categoryLoading) {
        return (
            <>
                <Breadcrumb pageName="Edit Product" />
                <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                    <div className="container mx-auto max-w-6xl px-4">
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
                <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                    <div className="container mx-auto max-w-6xl px-4">
                        <ProductFormSkeleton />
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <Breadcrumb pageName="Edit Product" />
            <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">Edit Product</h1>
                                <p className="text-sm text-gray-600">
                                    Update product details and variant information
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                <Icon icon="mdi:arrow-left" width={18} height={18} />
                                Back to Products
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                    <Icon icon="mdi:information" width={20} height={20} className="text-primary" />
                                    Basic Information
                                </h2>
                                <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Main Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.mainCategoryId}
                                                onChange={(e) => setFormData({ ...formData, mainCategoryId: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required>
                                                <option value="">Select Main Category</option>
                                                {mainCategories.map((category: any) => (
                                                    <option key={category._id} value={category.categoryId}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Sub Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.subCategoryId}
                                                onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                required
                                                disabled={!formData.mainCategoryId}>
                                                <option value="">Select Sub Category</option>
                                                {subCategories.map((category: any) => (
                                                    <option key={category._id} value={category.subCategoryId}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {subCategoryAttributes.length > 0 && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs text-blue-800 flex items-center gap-1.5">
                                                <Icon icon="mdi:check-circle" width={16} height={16} />
                                                <strong>{subCategoryAttributes.length}</strong> variant attributes loaded from this category
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Brand
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                placeholder="e.g., Samsung, Apple"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Warranty Period
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.warranty}
                                                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                placeholder="e.g., 1 year, 6 months"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Short Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.shortDescription}
                                            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                            rows={2}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Optional Metadata */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Highlights */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                                            <Icon icon="mdi:star" width={20} height={20} className="text-primary" />
                                            Highlights
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowHighlights(!showHighlights)
                                                if (!showHighlights && highlights.length === 0) {
                                                    addHighlight()
                                                }
                                            }}
                                            className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <Icon icon={showHighlights ? "mdi:minus" : "mdi:plus"} width={16} height={16} />
                                            {showHighlights ? 'Hide' : 'Add'}
                                        </button>
                                    </div>
                                    {showHighlights && (
                                        <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-2">
                                            {highlights.map((highlight, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={highlight}
                                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        placeholder={`Highlight ${index + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHighlight(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition">
                                                        <Icon icon="mdi:delete" width={18} height={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addHighlight}
                                                className="w-full p-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-primary hover:text-primary transition flex items-center justify-center gap-1.5">
                                                <Icon icon="mdi:plus" width={16} height={16} />
                                                Add Highlight
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Specifications */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                                            <Icon icon="mdi:format-list-bulleted" width={20} height={20} className="text-primary" />
                                            Specifications
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSpecifications(!showSpecifications)
                                                if (!showSpecifications && specifications.length === 0) {
                                                    addSpecification()
                                                }
                                            }}
                                            className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <Icon icon={showSpecifications ? "mdi:minus" : "mdi:plus"} width={16} height={16} />
                                            {showSpecifications ? 'Hide' : 'Add'}
                                        </button>
                                    </div>
                                    {showSpecifications && (
                                        <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-2">
                                            {specifications.map((spec, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={spec.name}
                                                        onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                                                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        placeholder="Name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={spec.value}
                                                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        placeholder="Value"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecification(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition">
                                                        <Icon icon="mdi:delete" width={18} height={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addSpecification}
                                                className="w-full p-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-primary hover:text-primary transition flex items-center justify-center gap-1.5">
                                                <Icon icon="mdi:plus" width={16} height={16} />
                                                Add Specification
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                    <Icon icon="mdi:package-variant" width={20} height={20} className="text-primary" />
                                    Product Variants
                                </h2>

                                {variants.map((variant, variantIndex) => (
                                    <div key={variantIndex} className="mb-6 border border-gray-200 rounded-lg p-5 bg-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-semibold text-black">Variant {variantIndex + 1}</h3>
                                        </div>

                                        <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-4 rounded-lg space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                        Price (₹) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(variantIndex, 'price', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                        Sale Price (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.salePrice}
                                                        onChange={(e) => updateVariant(variantIndex, 'salePrice', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                        Stock <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => updateVariant(variantIndex, 'stock', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {variant.salePrice && parseFloat(variant.salePrice) > 0 && commissionPercentage > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                    <div className="col-span-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Icon icon="mdi:information-outline" className="text-blue-600 mt-0.5" width={16} height={16} />
                                                            <div className="flex-1">
                                                                <p className="text-xs text-blue-900 font-medium mb-1">
                                                                    Platform Commission: <strong>{commissionPercentage}%</strong>
                                                                </p>
                                                                <p className="text-xs text-blue-700">
                                                                    The platform will deduct {commissionPercentage}% from each sale.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <Icon icon="mdi:calculator" className="text-green-600 mt-0.5" width={16} height={16} />
                                                            <div className="flex-1 text-xs space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-700">Sale Price:</span>
                                                                    <span className="font-semibold text-gray-900">₹{parseFloat(variant.salePrice).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-700">Platform Fee ({commissionPercentage}%):</span>
                                                                    <span className="font-semibold text-red-600">-₹{(parseFloat(variant.salePrice) * commissionPercentage / 100).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between pt-1 border-t border-green-300">
                                                                    <span className="text-green-800 font-semibold">You Receive:</span>
                                                                    <span className="font-bold text-green-800">₹{(parseFloat(variant.salePrice) * (1 - commissionPercentage / 100)).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                        Delivery Days <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={variant.deliveryDays}
                                                        onChange={(e) => updateVariant(variantIndex, 'deliveryDays', e.target.value)}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                        Pickup Address
                                                    </label>
                                                    {pickupAddresses.length > 0 ? (
                                                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                                                            {pickupAddresses.map((address: any) => (
                                                                <div
                                                                    key={address.id}
                                                                    className="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                    onClick={() => updateVariant(variantIndex, 'pickupAddress', address.id)}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`pickup-address-${variantIndex}`}
                                                                        checked={variant.pickupAddress === address.id}
                                                                        onChange={() => updateVariant(variantIndex, 'pickupAddress', address.id)}
                                                                        className="mt-0.5 cursor-pointer"
                                                                    />
                                                                    <div className="flex-1 text-xs">
                                                                        <p className="font-semibold text-gray-900">{address.name}</p>
                                                                        <p className="text-gray-600">
                                                                            {address.addressLine1}
                                                                            {address.landmark && `, ${address.landmark}`}
                                                                        </p>
                                                                        <p className="text-gray-600">
                                                                            {address.city}, {address.district}, {address.state} - {address.pincode}
                                                                        </p>
                                                                        <p className="text-gray-600">Phone: {address.phone}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500 p-3 border border-gray-300 rounded-md bg-gray-50">
                                                            No pickup addresses available. Please add one from the{' '}
                                                            <Link href="/pickup-addresses" className="text-primary hover:underline">
                                                                Pickup Addresses
                                                            </Link>{' '}
                                                            page.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {subCategoryAttributes.length > 0 && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                                        Variant Attributes <span className="text-red-500">*</span>
                                                    </label>
                                                    <p className="text-xs text-gray-600 mb-2">These attributes are specific to this variant</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {variant.attributes.map((attr, attrIndex) => (
                                                            <div key={attrIndex}>
                                                                <label className="block text-xs text-gray-600 mb-1">
                                                                    {attr.name} <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={attr.value}
                                                                    onChange={(e) => updateVariantAttribute(variantIndex, attrIndex, e.target.value)}
                                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                    placeholder={`Enter ${attr.name.toLowerCase()}`}
                                                                    required
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Variant Images <span className="text-red-500">*</span>
                                                </label>
                                                <p className="text-xs text-gray-600 mb-2">Upload images specific to this variant</p>
                                                
                                                {variant.existingImages.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-xs font-medium text-gray-700 mb-2">Existing Images ({variant.existingImages.length})</p>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {variant.existingImages.map((image, imageIndex) => (
                                                                <div key={imageIndex} className="relative">
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                                                                        alt={`Existing ${imageIndex + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeVariantExistingImage(variantIndex, imageIndex)}
                                                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition">
                                                                        <Icon icon="mdi:close" width={14} height={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    multiple
                                                    onChange={(e) => handleVariantImageChange(variantIndex, e)}
                                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                                />
                                                
                                                {variant.images.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-medium text-gray-700 mb-2">New Images ({variant.images.length})</p>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {getVariantImagePreviews(variantIndex).map((preview, imageIndex) => (
                                                                <div key={imageIndex} className="relative">
                                                                    <img
                                                                        src={preview}
                                                                        alt={`New ${imageIndex + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition">
                                                                        <Icon icon="mdi:close" width={14} height={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Link
                                    href="/products"
                                    className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={productLoading || !hasFormChanged() || !isFormValid()}
                                    className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    <Icon icon="mdi:check" width={18} height={18} />
                                    Update Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}
