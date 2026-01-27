'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { usePickupAddress } from '@/hooks/usePickupAddress'
import { authService } from '@/services/authService'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import ProductFormSkeleton from '@/app/components/Skeleton/ProductForm'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loader from '@/app/components/Common/Loader'

interface Variant {
    price: string
    salePrice: string
    stock: string
    deliveryDays: string
    pickupAddress: string
    attributes: Array<{ name: string; value: string }>
    imageIndices: number[]
    images: File[]
}

export default function AddProductPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading: productLoading, createProduct, addVariant, checkProductBySlug } = useProducts()
    const { loading: categoryLoading, mainCategories, subCategories, fetchMainCategories, fetchSubCategories } = useCategories()
    const { loading: pickupLoading, addresses: pickupAddresses, fetchAddresses } = usePickupAddress()
    const hasFetchedCategories = useRef(false)
    const hasFetchedAddresses = useRef(false)
    const hasFetchedKYC = useRef(false)
    
    const [kycApproved, setKycApproved] = useState(false)
    const [kycLoading, setKycLoading] = useState(true)

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
    const [masterImages, setMasterImages] = useState<File[]>([])
    const [masterImagePreviews, setMasterImagePreviews] = useState<string[]>([])
    const [variants, setVariants] = useState<Variant[]>([{
        price: '',
        salePrice: '',
        stock: '',
        deliveryDays: '3',
        pickupAddress: '',
        attributes: [{ name: '', value: '' }],
        imageIndices: [],
        images: []
    }])

    const [subCategoryAttributes, setSubCategoryAttributes] = useState<any[]>([])
    const [commissionPercentage, setCommissionPercentage] = useState<number>(0)
    const [existingProduct, setExistingProduct] = useState<any>(null)
    const [showVariantOnlyMode, setShowVariantOnlyMode] = useState(false)
    const productCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isAutoFillingRef = useRef(false)

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedKYC.current) {
            fetchKYCStatus()
            hasFetchedKYC.current = true
        }

        if (!hasFetchedCategories.current) {
            fetchMainCategories()
            hasFetchedCategories.current = true
        }

        if (!hasFetchedAddresses.current) {
            fetchAddresses()
            hasFetchedAddresses.current = true
        }
    }, [isAuthenticated, isLoading, router])

    const fetchKYCStatus = async () => {
        try {
            setKycLoading(true)
            const response = await authService.getKYCStatus()
            if (response.success) {
                setKycApproved(response.data.kycApproved || false)
                if (!response.data.kycApproved) {
                    toast.error('Please complete KYC verification to add products', {
                        duration: 4000,
                    })
                    setTimeout(() => {
                        router.push('/products')
                    }, 2000)
                }
            }
        } catch (error: any) {
            console.error('Error fetching KYC status:', error)
            toast.error('Unable to verify KYC status')
            setTimeout(() => {
                router.push('/products')
            }, 2000)
        } finally {
            setKycLoading(false)
        }
    }

    useEffect(() => {
        if (formData.mainCategoryId) {
            fetchSubCategories(formData.mainCategoryId)
            if (!isAutoFillingRef.current) {
                setFormData(prev => ({ ...prev, subCategoryId: '' }))
                setSubCategoryAttributes([])
            }
        }
    }, [formData.mainCategoryId])

    useEffect(() => {
        const loadSubCategoryAttributes = async () => {
            if (formData.subCategoryId && subCategories.length > 0) {
                const subCategory = subCategories.find((cat: any) =>
                    cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId
                )
                if (subCategory && subCategory.attributes && subCategory.attributes.length > 0) {
                    setSubCategoryAttributes(subCategory.attributes)
                    setCommissionPercentage(subCategory.commissionPercentage || 0)

                    if (!isAutoFillingRef.current) {
                        setVariants(prev => prev.map(variant => ({
                            ...variant,
                            attributes: subCategory.attributes.map((attr: any) => ({
                                name: attr.name,
                                value: ''
                            }))
                        })))
                    } else {
                        setVariants([{
                            price: '',
                            salePrice: '',
                            stock: '',
                            deliveryDays: '3',
                            pickupAddress: '',
                            attributes: subCategory.attributes.map((attr: any) => ({
                                name: attr.name,
                                value: ''
                            })),
                            imageIndices: [],
                            images: []
                        }])
                    }
                } else {
                    setSubCategoryAttributes([])
                    setCommissionPercentage(0)
                }
            }
        }
        loadSubCategoryAttributes()
    }, [formData.subCategoryId, subCategories])

    useEffect(() => {
        if (productCheckTimeoutRef.current) {
            clearTimeout(productCheckTimeoutRef.current)
        }

        if (formData.productName.trim().length > 2 && !showVariantOnlyMode) {
            productCheckTimeoutRef.current = setTimeout(async () => {
                const result = await checkProductBySlug(formData.productName.trim())
                if (result && result.exists) {
                    setExistingProduct(result.product)
                    if (result.alreadyListed) {
                        toast.error('You have already listed this product')
                        setShowVariantOnlyMode(false)
                    } else {
                        setShowVariantOnlyMode(true)
                        isAutoFillingRef.current = true
                        setFormData({
                            productName: result.product.productName || '',
                            mainCategoryId: result.product.mainCategoryId || '',
                            subCategoryId: result.product.subCategoryId || '',
                            description: result.product.description || '',
                            shortDescription: result.product.shortDescription || '',
                            brand: result.product.brand || '',
                            warranty: result.product.warranty || '',
                        })
                        if (result.product.highlights && result.product.highlights.length > 0) {
                            setHighlights(result.product.highlights)
                            setShowHighlights(true)
                        }
                        if (result.product.specifications && result.product.specifications.length > 0) {
                            setSpecifications(result.product.specifications)
                            setShowSpecifications(true)
                        }
                        setTimeout(() => {
                            isAutoFillingRef.current = false
                        }, 1000)
                    }
                } else {
                    setExistingProduct(null)
                    setShowVariantOnlyMode(false)
                }
            }, 500)
        } else if (!showVariantOnlyMode) {
            setExistingProduct(null)
            setShowVariantOnlyMode(false)
        }

        return () => {
            if (productCheckTimeoutRef.current) {
                clearTimeout(productCheckTimeoutRef.current)
            }
        }
    }, [formData.productName])

    const handleMasterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)

            if (files.length < 1) {
                toast.error('Please select at least 1 image')
                return
            }
            if (files.length > 10) {
                toast.error('You can upload maximum 10 images')
                return
            }

            const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
            const invalidFiles = files.filter(file => !validTypes.includes(file.type))
            if (invalidFiles.length > 0) {
                toast.error('Only PNG, JPG, and JPEG files are allowed')
                return
            }

            setMasterImages(files)
            const previews = files.map(file => URL.createObjectURL(file))
            setMasterImagePreviews(previews)
        }
    }

    const removeMasterImage = (index: number) => {
        setMasterImages(prev => prev.filter((_, i) => i !== index))
        setMasterImagePreviews(prev => prev.filter((_, i) => i !== index))

        setVariants(prev => prev.map(variant => ({
            ...variant,
            imageIndices: variant.imageIndices.filter(idx => idx !== index).map(idx => idx > index ? idx - 1 : idx)
        })))
    }

    const addVariantToList = () => {
        setVariants([...variants, {
            price: '',
            salePrice: '',
            stock: '',
            deliveryDays: '3',
            pickupAddress: '',
            attributes: subCategoryAttributes.map(attr => ({ name: attr.name, value: '' })),
            imageIndices: [],
            images: []
        }])
    }

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index))
        }
    }

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

    const toggleImageIndex = (variantIndex: number, imageIndex: number) => {
        setVariants(prev => prev.map((variant, i) => {
            if (i === variantIndex) {
                const indices = variant.imageIndices.includes(imageIndex)
                    ? variant.imageIndices.filter(idx => idx !== imageIndex)
                    : [...variant.imageIndices, imageIndex]
                return { ...variant, imageIndices: indices }
            }
            return variant
        }))
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

    const isFormValid = () => {
        const validateVariant = (v: Variant) => {
            const priceValid = v.price.trim() !== ''
            const stockValid = v.stock.trim() !== ''
            const imagesValid = v.images.length > 0
            
            const attributesValid = v.attributes.every(a => {
                const subCatAttr = subCategoryAttributes.find((attr: any) => attr.name === a.name)
                const isRequired = subCatAttr?.required ?? true
                return !isRequired || a.value.trim() !== ''
            })
            
            return priceValid && stockValid && attributesValid && imagesValid
        }

        if (showVariantOnlyMode) {
            return variants.every(validateVariant)
        }

        return (
            formData.productName.trim() !== '' &&
            formData.mainCategoryId !== '' &&
            formData.subCategoryId !== '' &&
            formData.description.trim() !== '' &&
            formData.shortDescription.trim() !== '' &&
            variants.every(validateVariant)
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.userId) return

        if (!kycApproved) {
            toast.error('Please complete KYC verification to add products')
            return
        }

        if (showVariantOnlyMode && existingProduct) {
            const variantFormData = new FormData()
            const variant = variants[0]

            variantFormData.append('price', variant.price)
            if (variant.salePrice) variantFormData.append('salePrice', variant.salePrice)
            variantFormData.append('stock', variant.stock)
            variantFormData.append('deliveryDays', variant.deliveryDays)
            if (variant.pickupAddress) variantFormData.append('pickupAddress', variant.pickupAddress)

            const validAttributes = variant.attributes
                .filter(attr => {
                    const subCatAttr = subCategoryAttributes.find((a: any) => a.name === attr.name)
                    const isRequired = subCatAttr?.required ?? true
                    return isRequired ? attr.value.trim() !== '' : true
                })
                .map(attr => {
                    const subCatAttr = subCategoryAttributes.find((a: any) => a.name === attr.name)
                    return {
                        name: attr.name,
                        value: attr.value,
                        required: subCatAttr?.required ?? true
                    }
                })
            if (validAttributes.length > 0) {
                variantFormData.append('attributes', JSON.stringify(validAttributes))
            }

            variant.images.forEach((image) => {
                variantFormData.append('images', image)
            })

            const result = await addVariant(existingProduct.productId, variantFormData)
            if (result) {
                router.push('/products')
            }
            return
        }

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
        productFormData.append('userId', user.userId)
        productFormData.append('createdby', user.email)

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
            price: parseFloat(variant.price),
            salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
            stock: parseInt(variant.stock),
            deliveryDays: parseInt(variant.deliveryDays) || 3,
            pickupAddress: variant.pickupAddress || null,
            attributes: variant.attributes
                .filter(attr => {
                    const subCatAttr = subCategoryAttributes.find((a: any) => a.name === attr.name)
                    const isRequired = subCatAttr?.required ?? true
                    return isRequired ? attr.value.trim() !== '' : true
                })
                .map(attr => {
                    const subCatAttr = subCategoryAttributes.find((a: any) => a.name === attr.name)
                    return {
                        name: attr.name,
                        value: attr.value,
                        required: subCatAttr?.required ?? true
                    }
                })
        }))

        productFormData.append('variants', JSON.stringify(variantsData))

        variants.forEach((variant, index) => {
            variant.images.forEach((image) => {
                productFormData.append(`variantImages_${index}`, image)
            })
        })

        const result = await createProduct(productFormData)
        if (result) {
            router.push('/products')
        }
    }

    const getVariantImagePreviews = (variantIndex: number) => {
        const variant = variants[variantIndex]
        return variant.images.map(file => URL.createObjectURL(file))
    }

    if (isLoading || categoryLoading || kycLoading) {
        return (
            <>
                <Breadcrumb pageName="Add Product" />
                <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
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

    if (!kycApproved) {
        return (
            <>
                <Breadcrumb pageName="Add Product" />
                <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                            <div className="text-center">
                                <Icon icon="mdi:alert-circle" className="mx-auto text-orange-500 mb-4" width={64} height={64} />
                                <h1 className="text-2xl font-bold text-black mb-4">KYC Verification Required</h1>
                                <p className="text-gray-600 mb-6">
                                    You need to complete KYC verification before you can add products.
                                </p>
                                <Link
                                    href="/kyc"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:shield-check" width={18} height={18} />
                                    Complete KYC Verification
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <Breadcrumb pageName="Add Product" />
            <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">Add New Product</h1>
                                <p className="text-sm text-gray-600">
                                    {showVariantOnlyMode
                                        ? 'Product already exists in catalog. Add your pricing and stock details.'
                                        : 'Fill in the details to add a new product with variants'}
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                <Icon icon="mdi:arrow-left" width={18} height={18} />
                                Back to Products
                            </Link>
                        </div>

                        {/* {commissionPercentage > 0 && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Icon icon="mdi:information-outline" className="text-blue-600 mt-0.5" width={16} height={16} />
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-900 font-medium mb-1">
                                                Platform Commission: <strong>{commissionPercentage}%</strong>
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                The platform will deduct {commissionPercentage}% from each sale. Commission breakdown is displayed below the sale price for each variant.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Icon icon="mdi:information-outline" className="text-blue-600 mt-0.5" width={16} height={16} />
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-900 font-medium mb-1">
                                                Platform Commission: <strong>{commissionPercentage}%</strong>
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                The platform will deduct {commissionPercentage}% from each sale. Commission breakdown is displayed below the sale price for each variant.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}

                        <form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                    <Icon icon="mdi:information" width={20} height={20} className="text-primary" />
                                    Basic Information
                                </h2>
                                {showVariantOnlyMode && (
                                    <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-xs font-medium text-green-800 flex items-center gap-1.5">
                                            <Icon icon="mdi:check-circle" width={16} height={16} />
                                            Product exists, you can add your price and stock
                                        </p>
                                    </div>
                                )}
                                <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                            required
                                            disabled={showVariantOnlyMode}
                                        />
                                        {existingProduct && !showVariantOnlyMode && (
                                            <div className="mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                                                <p className="text-xs font-medium text-yellow-800 flex items-center gap-1.5">
                                                    <Icon icon="mdi:alert" width={16} height={16} />
                                                    Similar product exists in catalog
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Main Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.mainCategoryId}
                                                onChange={(e) => setFormData({ ...formData, mainCategoryId: e.target.value })}
                                                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                required
                                                disabled={showVariantOnlyMode}>
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
                                                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                required
                                                disabled={showVariantOnlyMode || !formData.mainCategoryId}>
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
                                                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                placeholder="e.g., Samsung, Apple"
                                                disabled={showVariantOnlyMode}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Warranty
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.warranty}
                                                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                placeholder="e.g., 2 years, 6 months"
                                                disabled={showVariantOnlyMode}
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
                                            rows={3}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                            required
                                            disabled={showVariantOnlyMode}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={5}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                            required
                                            disabled={showVariantOnlyMode}
                                        />
                                    </div>
                                </div>
                            </div>

                                    {/* Highlights and Specifications - Two Column Layout */}
                                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Highlights */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                                <Icon icon="mdi:star" width={20} height={20} className="text-primary" />
                                                Highlights (Optional)
                                            </h2>
                                            {showHighlights || highlights.length > 0 ? (
                                                <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-2">
                                                    <p className="text-xs text-gray-600 mb-3">Add key features and highlights of the product</p>
                                                    {highlights.map((highlight, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-gray-500 w-6">{index + 1}.</span>
                                                            <input
                                                                type="text"
                                                                value={highlight}
                                                                onChange={(e) => updateHighlight(index, e.target.value)}
                                                                className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                                placeholder="Enter highlight"
                                                                disabled={showVariantOnlyMode}
                                                            />
                                                            {!showVariantOnlyMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        removeHighlight(index)
                                                                        if (highlights.length === 1) setShowHighlights(false)
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                                    <Icon icon="mdi:close" width={18} height={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {!showVariantOnlyMode && (
                                                        <button
                                                            type="button"
                                                            onClick={addHighlight}
                                                            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition text-sm font-medium mt-2">
                                                            <Icon icon="mdi:plus-circle" width={18} height={18} />
                                                            Add Another Highlight
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowHighlights(true)
                                                        addHighlight()
                                                    }}
                                                    style={{ backgroundColor: 'rgb(249, 249, 249)' }}
                                                    className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition flex items-center justify-center gap-2 text-gray-600 hover:text-primary">
                                                    <Icon icon="mdi:plus-circle" width={20} height={20} />
                                                    <span className="text-sm font-medium">Add Product Highlights</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Specifications */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                                <Icon icon="mdi:clipboard-list" width={20} height={20} className="text-primary" />
                                                Specifications (Optional)
                                            </h2>
                                            {showSpecifications || specifications.length > 0 ? (
                                                <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-2">
                                                    <p className="text-xs text-gray-600 mb-3">Add general product specifications (e.g., Operating System, Processor, etc.)</p>
                                                    {specifications.map((spec, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={spec.name}
                                                                onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                                                                className={`w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                                placeholder="Name (e.g., Processor)"
                                                                disabled={showVariantOnlyMode}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={spec.value}
                                                                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                                                className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                                                placeholder="Value (e.g., Snapdragon 8 Gen 2)"
                                                                disabled={showVariantOnlyMode}
                                                            />
                                                            {!showVariantOnlyMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        removeSpecification(index)
                                                                        if (specifications.length === 1) setShowSpecifications(false)
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                                    <Icon icon="mdi:close" width={18} height={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {!showVariantOnlyMode && (
                                                        <button
                                                            type="button"
                                                            onClick={addSpecification}
                                                            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition text-sm font-medium mt-2">
                                                            <Icon icon="mdi:plus-circle" width={18} height={18} />
                                                            Add Another Specification
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSpecifications(true)
                                                        addSpecification()
                                                    }}
                                                    style={{ backgroundColor: 'rgb(249, 249, 249)' }}
                                                    className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition flex items-center justify-center gap-2 text-gray-600 hover:text-primary">
                                                    <Icon icon="mdi:plus-circle" width={20} height={20} />
                                                    <span className="text-sm font-medium">Add Product Specifications</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                            {/* Variants */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                                        <Icon icon="mdi:layers" width={20} height={20} className="text-primary" />
                                        Product Variants <span className="text-red-500">*</span>
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addVariantToList}
                                        disabled={showVariantOnlyMode ? !subCategoryAttributes.length : false}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${
                                            (showVariantOnlyMode && !subCategoryAttributes.length)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90'
                                        }`}>
                                        <Icon icon="mdi:plus" width={16} height={16} />
                                        Add Variant
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {variants.map((variant, variantIndex) => (
                                        <div key={variantIndex} style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg border border-gray-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-base font-semibold text-black">Variant {variantIndex + 1}</h3>
                                                {variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(variantIndex)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                        <Icon icon="mdi:delete" width={18} height={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
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
                                                        <input type="number" value={variant.salePrice} onChange={(e) => updateVariant(variantIndex, 'salePrice', e.target.value)}
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
                                                    <div>
                                                        {variant.salePrice && parseFloat(variant.salePrice) > 0 && commissionPercentage > 0 && (
                                                            <div className="col-span-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-start gap-2">
                                                                    <Icon icon="mdi:information-outline" className="text-blue-600 mt-0.5" width={16} height={16} />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs text-blue-900 font-medium mb-1">
                                                                            Platform Commission: <strong>{commissionPercentage}%</strong>
                                                                        </p>
                                                                        <p className="text-xs text-blue-700">
                                                                            The platform will deduct {commissionPercentage}% from each sale. Commission breakdown is displayed below the sale price for each variant.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {variant.salePrice && parseFloat(variant.salePrice) > 0 && commissionPercentage > 0 && (
                                                            <div className="col-span-6 p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-gray-600">Sale Price:</span>
                                                                    <span className="font-semibold text-gray-900">₹{parseFloat(variant.salePrice).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-red-600">Platform Fee ({commissionPercentage}%):</span>
                                                                    <span className="font-semibold text-red-600">- ₹{(parseFloat(variant.salePrice) * commissionPercentage / 100).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs pt-1 border-t border-green-300">
                                                                    <span className="text-green-700 font-medium">You Receive:</span>
                                                                    <span className="font-bold text-green-700">₹{(parseFloat(variant.salePrice) * (100 - commissionPercentage) / 100).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                            Delivery Days
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={variant.deliveryDays}
                                                            onChange={(e) => updateVariant(variantIndex, 'deliveryDays', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
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

                                                {subCategoryAttributes.length > 0 ? (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                                            Variant Attributes <span className="text-red-500">*</span>
                                                        </label>
                                                        <p className="text-xs text-gray-600 mb-2">These attributes are specific to this variant</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {variant.attributes.map((attr, attrIndex) => {
                                                                const subCatAttr = subCategoryAttributes.find((a: any) => a.name === attr.name)
                                                                const isRequired = subCatAttr?.required ?? true
                                                                const inputType = subCatAttr?.type === 'number' ? 'number' : subCatAttr?.type === 'boolean' ? 'text' : 'text'
                                                                
                                                                return (
                                                                    <div key={attrIndex}>
                                                                        <label className="block text-xs text-gray-600 mb-1">
                                                                            {attr.name} {isRequired && <span className="text-red-500">*</span>}
                                                                        </label>
                                                                        <input
                                                                            type={inputType}
                                                                            value={attr.value}
                                                                            onChange={(e) => updateVariantAttribute(variantIndex, attrIndex, e.target.value)}
                                                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                            placeholder={`Enter ${attr.name.toLowerCase()}`}
                                                                            required={isRequired}
                                                                        />
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <p className="text-xs text-yellow-800 flex items-center gap-1.5">
                                                            <Icon icon="mdi:alert" width={16} height={16} />
                                                            Please select a sub-category to load variant attributes
                                                        </p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                                        Variant Images <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="mb-3">
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/png,image/jpeg,image/jpg"
                                                                multiple
                                                                onChange={(e) => handleVariantImageChange(variantIndex, e)}
                                                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                            <Icon icon="mdi:information-outline" width={14} height={14} />
                                                            Upload product images (PNG, JPG, JPEG)
                                                        </p>
                                                    </div>

                                                    {/* Display uploaded variant images */}
                                                    {variant.images.length > 0 && (
                                                        <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                                                            <p className="text-xs font-medium text-gray-700 mb-2">Uploaded images ({variant.images.length}):</p>
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {variant.images.map((file, idx) => (
                                                                    <div key={idx} className="relative group">
                                                                        <img
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={`Variant ${variantIndex + 1} Image ${idx + 1}`}
                                                                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeVariantImage(variantIndex, idx)}
                                                                            className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition">
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
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.push('/products')}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={productLoading || !isFormValid()}
                                    className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {productLoading ? (
                                        <>
                                            <Icon icon="mdi:loading" className="animate-spin" width={18} height={18} />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:check-circle" width={18} height={18} />
                                            {showVariantOnlyMode ? 'Add Variant' : 'Create Product'}
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
