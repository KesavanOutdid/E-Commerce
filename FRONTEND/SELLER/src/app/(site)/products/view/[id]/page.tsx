'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useProducts } from '@/hooks/useProducts'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import Loader from '@/app/components/Common/Loader'
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
    const productId = params.id as string
    const { user, isAuthenticated, isLoading } = useAuth()
    const { loading, fetchProductById, fetchSellerListings } = useProducts()
    const [product, setProduct] = useState<any>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [listingData, setListingData] = useState<any>(null)

    useEffect(() => {
        if (isLoading) return
        
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const loadProduct = async () => {
            const data = await fetchProductById(productId)
            if (data) {
                setProduct(data)
            } else {
                router.push('/products')
            }
        }
        
        const loadListingData = async () => {
            const response = await fetchSellerListings(1, 100)
            if (response?.data?.listings) {
                const listing = response.data.listings.find((l: any) => l.productId === productId)
                if (listing) {
                    setListingData(listing)
                }
            }
        }
        
        loadProduct()
        loadListingData()
    }, [isAuthenticated, isLoading, router, productId])

    if (isLoading || loading || !product) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <>
            <Breadcrumb pageName="Product Details" />
            <section className="bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-black">Product Details</h1>
                            <div className="flex gap-4">
                                <Link
                                    href={`/products/edit/${product.productId}`}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                                    <Icon icon="mdi:pencil" width={20} height={20} />
                                    Edit Product
                                </Link>
                                <Link
                                    href="/products"
                                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                                    <Icon icon="mdi:arrow-left" width={20} height={20} />
                                    Back to Products
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div>
                                <div className="mb-4 relative">
                                    <img
                                        src={product.images[selectedImage] ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[selectedImage]}` : '/images/placeholder.png'}
                                        alt={product.productName}
                                        className="w-full h-96 object-contain bg-gray-50 rounded-xl border-2 border-gray-200"
                                    />
                                    {product.images && product.images.length > 0 && (
                                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Icon icon="mdi:image-multiple" width={16} height={16} />
                                            {selectedImage + 1} / {product.images.length}
                                        </div>
                                    )}
                                </div>
                                {product.images.length > 1 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Icon icon="mdi:view-gallery" width={18} height={18} />
                                                Product Images ({product.images.length})
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {product.images.map((image: string, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`h-20 rounded-lg border-2 overflow-hidden relative ${
                                                        selectedImage === index
                                                            ? 'border-primary ring-2 ring-primary/50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                                                        alt={`${product.productName} ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {selectedImage === index && (
                                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                            <Icon icon="mdi:check-circle" className="text-primary" width={24} height={24} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-black mb-4">{product.productName}</h2>
                                
                                {listingData ? (
                                    <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-primary/20">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Icon icon="mdi:storefront" className="text-primary" width={24} height={24} />
                                            <h3 className="text-lg font-semibold text-gray-900">Your Listing Price</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:currency-inr" width={16} height={16} />
                                                    Price
                                                </p>
                                                <p className="text-2xl font-bold text-primary">₹{Number(listingData.price).toLocaleString('en-IN')}</p>
                                            </div>
                                            {listingData.salePrice && (
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                        <Icon icon="mdi:tag" width={16} height={16} />
                                                        Sale Price
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-600">₹{Number(listingData.salePrice).toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                            <div className="bg-white rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:package-variant" width={16} height={16} />
                                                    Stock
                                                </p>
                                                <p className="text-xl font-bold text-gray-900">{listingData.stock} units</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:truck-delivery" width={16} height={16} />
                                                    Delivery
                                                </p>
                                                <p className="text-xl font-bold text-gray-900">{listingData.deliveryDays} days</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:currency-inr" width={16} height={16} />
                                                    Base Price
                                                </p>
                                                <p className="text-2xl font-bold text-primary">₹{Number(product.price).toLocaleString('en-IN')}</p>
                                            </div>
                                            {product.salePrice && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                        <Icon icon="mdi:tag" width={16} height={16} />
                                                        Sale Price
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-600">₹{Number(product.salePrice).toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                    <Icon icon="mdi:package-variant" width={16} height={16} />
                                                    Stock
                                                </p>
                                                <p className="text-xl font-bold text-gray-900">{product.stock} units</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                        product.status
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        <Icon 
                                            icon={product.status ? 'mdi:check-circle' : 'mdi:close-circle'} 
                                            width={16} 
                                            height={16} 
                                        />
                                        {product.status ? 'Active' : 'Inactive'}
                                    </span>
                                    {listingData && (
                                        <span className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            listingData.approvalStatus === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            <Icon 
                                                icon={listingData.approvalStatus === 'approved' ? 'mdi:check-decagram' : 'mdi:clock-outline'} 
                                                width={16} 
                                                height={16} 
                                            />
                                            {listingData.approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-black mb-3">Short Description</h3>
                                    <p className="text-gray-600">{product.shortDescription}</p>
                                </div>

                                {product.attributes && product.attributes.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-black mb-3">Attributes</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.attributes.map((attr: any, index: number) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-600">{attr.name}</p>
                                                    <p className="font-semibold text-black">{attr.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-xl font-semibold text-black mb-4">Full Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                        </div>

                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-xl font-semibold text-black mb-4">Product Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Product ID</p>
                                    <p className="font-medium text-black">{product.productId}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">SKU/Slug</p>
                                    <p className="font-medium text-black">{product.slug}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                                    <p className="font-medium text-black flex items-center gap-1">
                                        <Icon icon="mdi:star" className="text-yellow-500" width={20} height={20} />
                                        {product.avgRating || 0} ({product.totalReviews || 0} reviews)
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Created By</p>
                                    <p className="font-medium text-black">{product.createdby}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                                    <p className="font-medium text-black">{formatIndiaTime(product.createdAt)}</p>
                                </div>
                                {product.updatedAt && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                        <p className="font-medium text-black">{formatIndiaTime(product.updatedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
