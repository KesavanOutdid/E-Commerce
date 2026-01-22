'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import ProductViewSkeleton from '@/app/components/Skeleton/ProductView'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'

const formatIndiaTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ProductViewPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading, fetchProductById } = useProducts()
    const [product, setProduct] = useState<any>(null)
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [showFullShortDesc, setShowFullShortDesc] = useState(false)
    const [showFullDesc, setShowFullDesc] = useState(false)

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const loadProduct = async () => {
            const data = await fetchProductById(id)
            if (data) {
                setProduct(data)
            } else {
                router.push('/products')
            }
        }

        loadProduct()
    }, [isAuthenticated, isLoading, router, id])

    if (isLoading || loading || !product) {
        return (
            <>
                <Breadcrumb pageName="Product Details" />
                <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                    <div className="container mx-auto max-w-6xl px-4">
                        <ProductViewSkeleton />
                    </div>
                </section>
            </>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const selectedVariant = product.variants && product.variants.length > 0 ? product.variants[selectedVariantIndex] : null
    const variantImages = selectedVariant?.images || []

    const truncateText = (text: string, lines: number = 7) => {
        if (!text) return ''
        const textLines = text.split('\n')
        if (textLines.length <= lines) return text
        return textLines.slice(0, lines).join('\n')
    }

    const needsTruncation = (text: string, lines: number = 7) => {
        if (!text) return false
        return text.split('\n').length > lines
    }

    return (
        <>
            <Breadcrumb pageName="Product Details" />
            <section style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="pb-10">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        {/* Header */}
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">Product Details</h1>
                                <p className="text-sm text-gray-600">View complete product and variant information</p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={`/products/edit/${product.productId}`}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition flex items-center gap-2">
                                    <Icon icon="mdi:pencil" width={18} height={18} />
                                    Edit Product
                                </Link>
                                <Link
                                    href="/products"
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
                                    <Icon icon="mdi:arrow-left" width={18} height={18} />
                                    Back to Products
                                </Link>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                <Icon icon="mdi:information" width={20} height={20} className="text-primary" />
                                Basic Information
                            </h2>
                            <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Product Name</label>
                                    <p className="text-base text-gray-700">{product.productName}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Main Category</label>
                                        <p className="text-base text-gray-700">{product.mainCategoryName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Sub Category</label>
                                        <p className="text-base text-gray-700">{product.subCategoryName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Brand</label>
                                        <p className="text-base text-gray-700">{product.brand || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Warranty</label>
                                        <p className="text-base text-gray-700">{product.warranty || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Short Description</label>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {showFullShortDesc || !needsTruncation(product.shortDescription || '', 7)
                                            ? product.shortDescription || 'N/A'
                                            : truncateText(product.shortDescription || '', 7)}
                                    </p>
                                    {needsTruncation(product.shortDescription || '', 7) && (
                                        <button
                                            onClick={() => setShowFullShortDesc(!showFullShortDesc)}
                                            className="mt-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                                            {showFullShortDesc ? (
                                                <>
                                                    <Icon icon="mdi:chevron-up" width={16} height={16} />
                                                    Read Less
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:chevron-down" width={16} height={16} />
                                                    Read More
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Description</label>
                                    <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {showFullDesc || !needsTruncation(product.description || '', 7)
                                            ? product.description || 'N/A'
                                            : truncateText(product.description || '', 7)}
                                    </p>
                                    {needsTruncation(product.description || '', 7) && (
                                        <button
                                            onClick={() => setShowFullDesc(!showFullDesc)}
                                            className="mt-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                                            {showFullDesc ? (
                                                <>
                                                    <Icon icon="mdi:chevron-up" width={16} height={16} />
                                                    Read Less
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:chevron-down" width={16} height={16} />
                                                    Read More
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Status</label>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <Icon icon={product.status ? 'mdi:check-circle' : 'mdi:close-circle'} width={14} height={14} />
                                            {product.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-black mb-1">Approval Status</label>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            <Icon icon={product.approvalStatus === 'approved' ? 'mdi:check-decagram' : 'mdi:clock-outline'} width={14} height={14} />
                                            {product.approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Highlights & Specifications */}
                        {(product.highlights?.length > 0 || product.specifications?.length > 0) && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.highlights && product.highlights.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                            <Icon icon="mdi:star" width={20} height={20} className="text-primary" />
                                            Highlights
                                        </h2>
                                        <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg">
                                            <ul className="space-y-2">
                                                {product.highlights.map((highlight: string, index: number) => (
                                                    <li key={index} className="text-sm text-black flex items-start gap-2">
                                                        <Icon icon="mdi:check" className="text-green-600 mt-0.5 flex-shrink-0" width={16} height={16} />
                                                        <span>{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {product.specifications && product.specifications.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                            <Icon icon="mdi:format-list-bulleted" width={20} height={20} className="text-primary" />
                                            Specifications
                                        </h2>
                                        <div style={{ backgroundColor: 'rgb(249, 249, 249)' }} className="p-5 rounded-lg">
                                            <div className="space-y-2">
                                                {product.specifications.map((spec: any, index: number) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span className="text-gray-700 font-medium">{spec.name}:</span>
                                                        <span className="text-black">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variants Section */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                                    <Icon icon="mdi:package-variant" width={20} height={20} className="text-primary" />
                                    Product Variants ({product.variants.length})
                                </h2>

                                {/* Variant Tabs */}
                                {product.variants.length > 1 && (
                                    <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                                        {product.variants.map((variant: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedVariantIndex(index)
                                                    setSelectedImageIndex(0)
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${selectedVariantIndex === index
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}>
                                                Variant {index + 1}
                                                {variant.attributes && variant.attributes.length > 0 && (
                                                    <span className="ml-2 text-xs opacity-80">
                                                        ({variant.attributes.map((a: any) => a.value).join(', ')})
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedVariant && (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                                            <h3 className="text-base font-semibold text-black">Variant {selectedVariantIndex + 1} Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                            {/* Left Side - Images Only */}
                                            <div className="p-5 bg-white border-r border-gray-200">
                                                {variantImages.length > 0 ? (
                                                    <div className="sticky top-4">
                                                        <label className="block text-sm font-bold text-black mb-3">Variant Images ({variantImages.length})</label>
                                                        <div className="mb-4">
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_API_URL}${variantImages[selectedImageIndex]}`}
                                                                alt={`Variant ${selectedVariantIndex + 1} Image ${selectedImageIndex + 1}`}
                                                                className="w-full h-96 object-contain bg-gray-50 rounded-lg border border-gray-200"
                                                            />
                                                        </div>
                                                        {variantImages.length > 1 && (
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {variantImages.map((image: string, imgIndex: number) => (
                                                                    <button
                                                                        key={imgIndex}
                                                                        onClick={() => setSelectedImageIndex(imgIndex)}
                                                                        className={`h-16 rounded-lg border-2 overflow-hidden transition ${selectedImageIndex === imgIndex
                                                                            ? 'border-primary ring-2 ring-primary/50'
                                                                            : 'border-gray-200 hover:border-gray-300'
                                                                            }`}>
                                                                        <img
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                                                                            alt={`Thumbnail ${imgIndex + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
                                                        <p className="text-sm text-gray-500">No images available</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Side - All Details Scrollable */}
                                            <div className="p-5 bg-white max-h-[700px] overflow-y-auto">
                                                <div className="space-y-4">

                                                    {/* Row 1: Price, Sale Price, Stock */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Price */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Price</label>
                                                            <p className="text-xl font-bold line-through text-gray-500">₹{selectedVariant.price?.toLocaleString('en-IN')}</p>
                                                        </div>

                                                        {/* Sale Price */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Sale Price</label>
                                                            <p className="text-xl font-bold text-green-600">₹{selectedVariant.salePrice > 0 ? selectedVariant.salePrice?.toLocaleString('en-IN') : selectedVariant.price?.toLocaleString('en-IN')}</p>
                                                        </div>

                                                        {/* Stock */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Stock</label>
                                                            <p className="text-lg font-bold text-gray-900">{selectedVariant.stock} units</p>
                                                        </div>
                                                    </div>

                                                    {/* Commission Breakdown */}
                                                    {selectedVariant.salePrice > 0 && product.commissionPercentage > 0 && (
                                                        <div className="pt-3 border-t border-gray-100 space-y-3">
                                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-start gap-2">
                                                                    <Icon icon="mdi:information-outline" className="text-blue-600 mt-0.5" width={16} height={16} />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs text-blue-900 font-medium mb-1">
                                                                            Platform Commission: <strong>{product.commissionPercentage}%</strong>
                                                                        </p>
                                                                        <p className="text-xs text-blue-700">
                                                                            The platform deducts {product.commissionPercentage}% from each sale.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                                <div className="flex items-start gap-2">
                                                                    <Icon icon="mdi:calculator" className="text-green-600 mt-0.5" width={16} height={16} />
                                                                    <div className="flex-1 text-xs space-y-1">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-700">Sale Price:</span>
                                                                            <span className="font-semibold text-gray-900">₹{selectedVariant.salePrice.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-700">Platform Fee ({product.commissionPercentage}%):</span>
                                                                            <span className="font-semibold text-red-600">-₹{(selectedVariant.salePrice * product.commissionPercentage / 100).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between pt-1 border-t border-green-300">
                                                                            <span className="text-green-800 font-semibold">You Receive:</span>
                                                                            <span className="font-bold text-green-800">₹{(selectedVariant.salePrice * (1 - product.commissionPercentage / 100)).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Row 2: Delivery Days, Status, Approval */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                                                        {/* Delivery Days */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Delivery Days</label>
                                                            <p className="text-base text-gray-700">{selectedVariant.deliveryDays || 'N/A'} days</p>
                                                        </div>

                                                        {/* Status */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Status</label>
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${selectedVariant.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                <Icon icon={selectedVariant.status ? 'mdi:check-circle' : 'mdi:close-circle'} width={14} height={14} />
                                                                {selectedVariant.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>

                                                        {/* Approval */}
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Approval</label>
                                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${selectedVariant.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                <Icon icon={selectedVariant.approvalStatus === 'approved' ? 'mdi:check-decagram' : 'mdi:clock-outline'} width={14} height={14} />
                                                                {selectedVariant.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Variant Attributes */}
                                                    {selectedVariant.attributes && selectedVariant.attributes.length > 0 && (
                                                        <div className="pt-3 border-t border-gray-100">
                                                            <label className="block text-sm font-bold text-black mb-3">Variant Attributes</label>
                                                            <div className="space-y-2">
                                                                {selectedVariant.attributes.map((attr: any, attrIndex: number) => (
                                                                    <div key={attrIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                        <p className="text-sm font-bold text-black mb-1">{attr.name}</p>
                                                                        <p className="text-base text-gray-700">{attr.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Timestamps */}
                                                    <div className="pt-3 border-t border-gray-100 space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Created At</label>
                                                            <p className="text-sm text-gray-600">{formatIndiaTime(selectedVariant.createdAt)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-black mb-1">Updated At</label>
                                                            <p className="text-sm text-gray-600">{formatIndiaTime(selectedVariant.updatedAt)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Product Timestamps */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Product Created At</label>
                                    <p className="text-sm text-gray-600">{formatIndiaTime(product.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Product Updated At</label>
                                    <p className="text-sm text-gray-600">{formatIndiaTime(product.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
