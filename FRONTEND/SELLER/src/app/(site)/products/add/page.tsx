'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

export default function AddProductPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading: productLoading, createProduct, createListing, checkProductBySlug } = useProducts()
    const { loading: categoryLoading, mainCategories, subCategories, fetchMainCategories, fetchSubCategories, fetchSubCategoryById } = useCategories()
    const hasFetchedCategories = useRef(false)
    
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
        attributes: [] as Array<{ name: string; value: string; slug?: string; required?: boolean }>,
    })
    const [subCategoryAttributes, setSubCategoryAttributes] = useState<any[]>([])
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [imageError, setImageError] = useState('')
    const [existingProduct, setExistingProduct] = useState<any>(null)
    const [showPriceStockForm, setShowPriceStockForm] = useState(false)
    const productCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isLoading) return
        
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        if (!hasFetchedCategories.current) {
            fetchMainCategories()
            hasFetchedCategories.current = true
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (formData.mainCategoryId) {
            fetchSubCategories(formData.mainCategoryId)
            setFormData(prev => ({ ...prev, subCategoryId: '', attributes: [] }))
            setSubCategoryAttributes([])
        } else {
            setSubCategoryAttributes([])
            setFormData(prev => ({ ...prev, subCategoryId: '', attributes: [] }))
        }
    }, [formData.mainCategoryId])

    useEffect(() => {
        const loadSubCategoryAttributes = async () => {
            if (formData.subCategoryId) {
                const subCategory = subCategories.find((cat: any) => cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId)
                if (subCategory && subCategory.attributes && subCategory.attributes.length > 0) {
                    setSubCategoryAttributes(subCategory.attributes)
                    const initialAttributes = subCategory.attributes.map((attr: any) => ({
                        name: attr.name,
                        slug: attr.slug,
                        value: '',
                        required: attr.required
                    }))
                    setFormData(prev => ({ ...prev, attributes: initialAttributes }))
                } else {
                    setSubCategoryAttributes([])
                    setFormData(prev => ({ ...prev, attributes: [] }))
                }
            }
        }
        loadSubCategoryAttributes()
    }, [formData.subCategoryId, subCategories])

    useEffect(() => {
        if (productCheckTimeoutRef.current) {
            clearTimeout(productCheckTimeoutRef.current)
        }

        if (formData.productName.trim().length > 2) {
            productCheckTimeoutRef.current = setTimeout(async () => {
                const result = await checkProductBySlug(formData.productName.trim())
                if (result && result.exists) {
                    setExistingProduct(result.product)
                    if (result.alreadyListed) {
                        setShowPriceStockForm(false)
                    } else {
                        setShowPriceStockForm(true)
                    }
                } else {
                    setExistingProduct(null)
                    setShowPriceStockForm(false)
                }
            }, 500)
        } else {
            setExistingProduct(null)
            setShowPriceStockForm(false)
        }

        return () => {
            if (productCheckTimeoutRef.current) {
                clearTimeout(productCheckTimeoutRef.current)
            }
        }
    }, [formData.productName])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            
            if (files.length < 1) {
                setImageError('Please select at least 1 image')
                return
            }
            if (files.length > 10) {
                setImageError('You can upload maximum 10 images')
                return
            }
            
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
            const invalidFiles = files.filter(file => !validTypes.includes(file.type))
            if (invalidFiles.length > 0) {
                setImageError('Only PNG, JPG, and JPEG files are allowed')
                return
            }
            
            setImageError('')
            setImages(files)
            
            const previews = files.map(file => URL.createObjectURL(file))
            setImagePreviews(previews)
        }
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)
        setImages(newImages)
        setImagePreviews(newPreviews)
    }

    const updateAttribute = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, i) => 
                i === index ? { ...attr, value } : attr
            )
        }))
    }

    const isFormValid = () => {
        const requiredAttributesFilled = formData.attributes
            .filter(attr => attr.required)
            .every(attr => attr.value.trim() !== '')
        
        return (
            formData.productName.trim() !== '' &&
            formData.mainCategoryId !== '' &&
            formData.subCategoryId !== '' &&
            formData.description.trim() !== '' &&
            formData.shortDescription.trim() !== '' &&
            formData.price.trim() !== '' &&
            formData.stock.trim() !== '' &&
            images.length >= 1 &&
            images.length <= 10 &&
            requiredAttributesFilled
        )
    }

    const handleSubmitListing = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!existingProduct || !existingProduct.productId) return

        const price = parseFloat(formData.price)
        const stock = parseInt(formData.stock)

        if (isNaN(price) || isNaN(stock)) {
            setImageError('Please enter valid price and stock values')
            return
        }

        const result = await createListing({
            productId: existingProduct.productId,
            price,
            salePrice: formData.unitSize ? parseFloat(formData.unitSize) : undefined,
            stock,
            deliveryDays: 3
        })

        if (result) {
            router.push('/products')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (showPriceStockForm && existingProduct) {
            return handleSubmitListing(e)
        }
        
        if (!user?.userId) return

        const selectedSubCategory = subCategories.find((cat: any) => cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId)
        if (!selectedSubCategory) {
            setImageError('Please select a valid sub-category from the currently selected main category')
            return
        }
        
        setImageError('')
        
        const parentCategoryId = selectedSubCategory.parentId || formData.mainCategoryId
        
        console.log('Selected Main Category ID from form:', formData.mainCategoryId)
        console.log('Selected Sub Category ID:', formData.subCategoryId)
        console.log('Sub Category Parent ID:', parentCategoryId)
        
        const productFormData = new FormData()
        productFormData.append('productName', formData.productName)
        productFormData.append('mainCategoryId', parentCategoryId)
        productFormData.append('subCategoryId', formData.subCategoryId)
        productFormData.append('description', formData.description)
        productFormData.append('shortDescription', formData.shortDescription)
        productFormData.append('price', formData.price)
        productFormData.append('stock', formData.stock)
        productFormData.append('userId', user.userId)
        productFormData.append('createdby', user.email)
        
        const validAttributes = formData.attributes
            .filter(attr => attr.value.trim() !== '')
            .map(attr => ({
                name: attr.name,
                value: attr.value
            }))
        if (validAttributes.length > 0) {
            productFormData.append('attributes', JSON.stringify(validAttributes))
        }
        
        images.forEach((image) => {
            productFormData.append('images', image)
        })

        const result = await createProduct(productFormData)
        if (result) {
            router.push('/products')
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

    if (!user?.kycApproved) {
        return (
            <>
                <Breadcrumb pageName="Add Product" />
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center">
                                <Icon icon="mdi:alert-circle" className="mx-auto text-orange-500 mb-4" width={64} height={64} />
                                <h1 className="text-3xl font-bold text-black mb-4">KYC Verification Required</h1>
                                <p className="text-gray-600 mb-6">
                                    You need to complete KYC verification before you can add products.
                                </p>
                                <Link
                                    href="/kyc"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:shield-check" width={20} height={20} />
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
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-black mb-2">Add New Product</h1>
                            <p className="text-gray-600">
                                Fill in the details to add a new product to your store
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
                                            {existingProduct && (
                                                <div className={`mt-2 p-3 rounded-lg ${showPriceStockForm ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                                    <div className="flex items-start gap-2">
                                                        <Icon 
                                                            icon={showPriceStockForm ? "mdi:information" : "mdi:alert"} 
                                                            className={showPriceStockForm ? "text-blue-600" : "text-yellow-600"} 
                                                            width={20} 
                                                            height={20} 
                                                        />
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${showPriceStockForm ? 'text-blue-800' : 'text-yellow-800'}`}>
                                                                {showPriceStockForm 
                                                                    ? 'Product already exists in catalog!' 
                                                                    : 'You have already listed this product'}
                                                            </p>
                                                            <p className={`text-xs mt-1 ${showPriceStockForm ? 'text-blue-600' : 'text-yellow-600'}`}>
                                                                {showPriceStockForm 
                                                                    ? 'Just add your price and stock below to list it' 
                                                                    : 'You cannot list the same product twice. Please check your listings.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {!showPriceStockForm && (
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
                                        )}
                                        {showPriceStockForm && existingProduct && (
                                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Category:</span>
                                                        <p className="font-medium text-black">{existingProduct.mainCategoryName} / {existingProduct.subCategoryName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Description:</span>
                                                        <p className="font-medium text-black line-clamp-2">{existingProduct.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {!showPriceStockForm && (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
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
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                min="0"
                                                step="0.01"
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                min="0"
                                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!showPriceStockForm && formData.subCategoryId && formData.attributes.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:tag-multiple" width={24} height={24} className="text-primary" />
                                        Product Attributes
                                    </h2>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formData.attributes.map((attr, index) => (
                                                <div key={index}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {attr.name} {attr.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={attr.value}
                                                        onChange={(e) => updateAttribute(index, e.target.value)}
                                                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                                                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                                        required={attr.required}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!showPriceStockForm && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:image-multiple" width={24} height={24} className="text-primary" />
                                        Product Images <span className="text-red-500">* (Min 1, Max 10)</span>
                                    </h2>
                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        multiple
                                        onChange={handleImageChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-primary"
                                    />
                                    {imageError && (
                                        <p className="text-red-600 text-sm mt-2">{imageError}</p>
                                    )}
                                    {imagePreviews.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-2">{images.length} image(s) selected</p>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                                                            <Icon icon="mdi:close" width={16} height={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                            <div className="flex justify-end gap-4 mt-8">
                                <Link
                                    href="/products"
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={productLoading || (!showPriceStockForm && !isFormValid()) || (showPriceStockForm && (!formData.price || !formData.stock))}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {productLoading ? (
                                        <>
                                            <Loader />
                                            {showPriceStockForm ? 'Adding Listing...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:check" width={20} height={20} />
                                            {showPriceStockForm ? 'Add Listing' : 'Create Product'}
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
