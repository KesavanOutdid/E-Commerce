const Order = require('../../models/Order');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');
const User = require('../../models/User');
const { ObjectId } = require('mongodb');

const enrichOrderWithSellerDetails = async (order) => {
    if (!order.items || order.items.length === 0) return order;

    const enrichedItems = await Promise.all(
        order.items.map(async (item) => {
            try {
                const product = await Product.findById(item.productId);
                let variant = null;
                let sellerId = null;

                if (item.variantId) {
                    variant = await ProductVariant.findById(item.variantId);
                    if (variant) {
                        sellerId = variant.sellerId;
                    }
                }

                if (sellerId) {
                    const seller = await User.findByUserId(sellerId.toString());

                    const finalImages = (variant?.images && variant.images.length > 0)
                        ? variant.images
                        : (product?.images || []);

                    let pickupAddress = null;
                    if (variant?.pickupAddress && seller) {
                        const pickupAddr = seller.pickupAddresses?.find(
                            addr => addr.id?.toString() === variant.pickupAddress.toString()
                        );
                        pickupAddress = pickupAddr || null;
                    }

                    return {
                        ...item,
                        images: finalImages,
                        productImages: product?.images || [],
                        productDetails: product ? {
                            productName: product.productName,
                            images: product.images,
                            description: product.description,
                            shortDescription: product.shortDescription,
                            slug: product.slug
                        } : null,
                        variantDetails: variant ? {
                            variantId: variant.variantId,
                            attributes: variant.attributes,
                            price: variant.price,
                            salePrice: variant.salePrice,
                            stock: variant.stock,
                            images: variant.images,
                            deliveryDays: variant.deliveryDays,
                            pickupAddress: pickupAddress
                        } : null,
                        sellerDetails: seller ? {
                            sellerId: seller.userId,
                            sellerName: `${seller.firstName} ${seller.lastName}`,
                            sellerEmail: seller.email,
                            phone: seller.phone
                        } : null,
                        pickupAddress: pickupAddress
                    };
                }

                return item;
            } catch (error) {
                console.error(`Error fetching details for item ${item.productId}:`, error);
                return item;
            }
        })
    );

    return {
        ...order,
        items: enrichedItems
    };
};

exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to view your orders'
            });
        }

        const sellerQuery = ObjectId.isValid(sellerId)
            ? { $or: [{ sellerId: sellerId }, { sellerId: new ObjectId(sellerId) }] }
            : { sellerId: sellerId };

        const sellerVariants = await ProductVariant.collection().find(sellerQuery).toArray();

        if (!sellerVariants || sellerVariants.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No product variants found. Add product variants to receive orders',
                data: [],
                pagination: {
                    total: 0,
                    page: page,
                    limit: limit,
                    pages: 0
                }
            });
        }

        const variantIds = sellerVariants.map(variant => variant.variantId);

        const orders = await Order.collection().find({
            'items.variantId': { $in: variantIds }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No orders found for your products yet',
                data: [],
                pagination: {
                    total: 0,
                    page: page,
                    limit: limit,
                    pages: 0
                }
            });
        }

        const total = await Order.collection().countDocuments({
            'items.variantId': { $in: variantIds }
        });
        const totalPages = Math.ceil(total / limit);

        const filteredOrders = await Promise.all(
            orders.map(async (order) => {
                const filteredOrder = {
                    ...order,
                    items: (order.items || []).filter(item => variantIds.includes(item.variantId))
                };
                return await enrichOrderWithSellerDetails(filteredOrder);
            })
        );

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: filteredOrders,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                pages: totalPages
            }
        });
    } catch (error) {
        console.error('Error in getSellerOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to load orders. Please try again later'
        });
    }
};

exports.getSellerOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const sellerId = req.userId;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to view order details'
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const sellerQuery = ObjectId.isValid(sellerId)
            ? { $or: [{ sellerId: sellerId }, { sellerId: new ObjectId(sellerId) }] }
            : { sellerId: sellerId };

        const sellerVariants = await ProductVariant.collection().find(sellerQuery).toArray();

        if (!sellerVariants || sellerVariants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No product variants found for your account'
            });
        }

        const variantIds = sellerVariants.map(variant => variant.variantId);

        const order = await Order.findByOrderId(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const sellerItems = (order.items || []).filter(item => variantIds.includes(item.variantId));

        if (sellerItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'This order does not contain your products'
            });
        }

        const filteredOrder = {
            ...order,
            items: sellerItems
        };

        const enrichedOrder = await enrichOrderWithSellerDetails(filteredOrder);

        res.status(200).json({
            success: true,
            message: 'Order details retrieved successfully',
            data: enrichedOrder
        });
    } catch (error) {
        console.error('Error in getSellerOrderDetail:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to load order details. Please try again later'
        });
    }
};

exports.searchSellerOrders = async (req, res) => {
    try {
        const sellerId = req.userId;
        const { search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to view your orders'
            });
        }

        const sellerQuery = ObjectId.isValid(sellerId)
            ? { $or: [{ sellerId: sellerId }, { sellerId: new ObjectId(sellerId) }] }
            : { sellerId: sellerId };

        const sellerVariants = await ProductVariant.collection().find(sellerQuery).toArray();

        if (!sellerVariants || sellerVariants.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No product variants found. Add product variants to receive orders',
                data: [],
                pagination: {
                    total: 0,
                    page: page,
                    limit: limit,
                    pages: 0
                }
            });
        }

        const variantIds = sellerVariants.map(variant => variant.variantId);

        const pipeline = [
            {
                $match: {
                    'items.variantId': { $in: variantIds }
                }
            }
        ];

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { orderId: searchRegex },
                        { 'items.productName': searchRegex },
                        { paymentType: searchRegex },
                        { paymentStatus: searchRegex }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await Order.collection().aggregate(pipeline).toArray();

        const orders = result[0]?.data || [];
        const total = result[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);

        const filteredOrders = await Promise.all(
            orders.map(async (order) => {
                const filteredOrder = {
                    ...order,
                    items: (order.items || []).filter(item => variantIds.includes(item.variantId))
                };
                return await enrichOrderWithSellerDetails(filteredOrder);
            })
        );

        res.status(200).json({
            success: true,
            message: 'Search results retrieved successfully',
            data: filteredOrders,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                pages: totalPages
            }
        });
    } catch (error) {
        console.error('Error in searchSellerOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to search orders. Please try again later'
        });
    }
};
