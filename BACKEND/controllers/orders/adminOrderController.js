const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');

const enrichOrderWithSellerDetails = async (order) => {
    if (!order.items || order.items.length === 0) return order;

    const enrichedItems = await Promise.all(
        order.items.map(async (item) => {
            try {
                const product = await Product.findById(item.productId);
                let variant = null;
                let sellerId = null;
                let pickupAddress = null;

                if (item.variantId) {
                    variant = await ProductVariant.findById(item.variantId);
                    if (variant) {
                        sellerId = variant.sellerId;

                        if (variant.pickupAddress && variant.sellerId) {
                            const seller = await User.findByUserId(variant.sellerId.toString());
                            if (seller && seller.pickupAddresses) {
                                const pickupAddr = seller.pickupAddresses.find(
                                    addr => addr.id?.toString() === variant.pickupAddress.toString()
                                );
                                pickupAddress = pickupAddr || null;
                            }
                        }
                    }
                }

                const finalImages = (variant?.images && variant.images.length > 0)
                    ? variant.images
                    : (product?.images || []);

                let sellerDetails = null;
                if (sellerId) {
                    const seller = await User.findByUserId(sellerId.toString());
                    sellerDetails = seller ? {
                        sellerId: seller.userId,
                        sellerName: `${seller.firstName} ${seller.lastName}`,
                        sellerEmail: seller.email,
                        sellerPhone: seller.phone,
                        storeName: seller.sellerInfo?.storeName
                    } : null;
                } else if (product && product.userId) {
                    const seller = await User.findByUserId(product.userId);
                    sellerDetails = seller ? {
                        sellerId: seller.userId,
                        sellerName: `${seller.firstName} ${seller.lastName}`,
                        sellerEmail: seller.email,
                        sellerPhone: seller.phone,
                        storeName: seller.sellerInfo?.storeName
                    } : null;
                }

                return {
                    ...item,
                    images: finalImages,
                    productImages: product?.images || [],
                    pickupAddress: pickupAddress,
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
                    sellerDetails: sellerDetails
                };
            } catch (error) {
                console.error(`Error fetching details for product ${item.productId}:`, error);
                return item;
            }
        })
    );

    return {
        ...order,
        items: enrichedItems
    };
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, paymentType, paymentStatus, search } = req.query;

        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentType) filter.paymentType = paymentType.toLowerCase();
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { orderId: searchRegex },
                { 'deliveryAddress.name': searchRegex },
                { 'deliveryAddress.email': searchRegex },
                { userEmail: searchRegex },
                { paymentStatus: searchRegex },
                { orderStatus: searchRegex }
            ];
        }

        const orders = await Order.findAll({
            limit: limit,
            skip: skip,
            filter
        });

        const enrichedOrders = await Promise.all(
            orders.map(order => enrichOrderWithSellerDetails(order))
        );

        const total = await Order.countAll(filter);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: enrichedOrders,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                pages: totalPages
            }
        });
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve orders. Please try again later'
        });
    }
};

exports.getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const order = await Order.findByOrderId(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const enrichedOrder = await enrichOrderWithSellerDetails(order);

        res.status(200).json({
            success: true,
            message: 'Order details retrieved successfully',
            data: enrichedOrder
        });
    } catch (error) {
        console.error('Error in getOrderDetail:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to load order details. Please try again later'
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedBy: req.userEmail
        };

        const order = await Order.update(id, updateData);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error in updateOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update order. Please try again'
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingId, carrier, estimatedDeliveryDate, deliveryStatus } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const currentOrder = await Order.findByOrderId(id);
        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const statusHierarchy = ['pending', 'packed', 'shipped', 'out_of_delivery', 'delivered'];
        const currentStatusIndex = statusHierarchy.indexOf(currentOrder.orderStatus);
        const newStatusIndex = statusHierarchy.indexOf(status);

        // Prevent going back in status (except for cancelled/returned which aren't in hierarchy)
        if (newStatusIndex !== -1 && currentStatusIndex !== -1 && newStatusIndex < currentStatusIndex) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentOrder.orderStatus} to ${status}`
            });
        }

        // Handle skipped statuses for history
        const skippedHistoryEntries = [];
        if (newStatusIndex !== -1 && currentStatusIndex !== -1) {
            for (let i = currentStatusIndex + 1; i < newStatusIndex; i++) {
                skippedHistoryEntries.push({
                    status: statusHierarchy[i],
                    timestamp: new Date(),
                    updatedBy: req.userEmail,
                    note: 'Automatically updated due to subsequent status change'
                });
            }
        }

        const extraData = {};
        if (trackingId) extraData.trackingId = trackingId;
        if (carrier) extraData.carrier = carrier;
        if (estimatedDeliveryDate) extraData.estimatedDeliveryDate = estimatedDeliveryDate;
        if (deliveryStatus) extraData.deliveryStatus = deliveryStatus;

        // Payment status logic
        if (currentOrder.paymentType === 'online' || currentOrder.paymentType === 'razorpay') {
            if (['shipped', 'out_of_delivery', 'delivered'].includes(status)) {
                extraData.paymentStatus = 'completed';
            }
        }
        // For COD, user said "dont change payamenst status" - so we skip automatic update

        // If there are skipped statuses, we update history first or as part of update
        if (skippedHistoryEntries.length > 0) {
            await Order.updateStatusHistory(id, skippedHistoryEntries);
        }

        const order = await Order.updateOrderStatus(id, status, req.userEmail, extraData);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update order status. Please try again'
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Payment status is required'
            });
        }

        const order = await Order.updatePaymentStatus(id, paymentStatus, req.userEmail);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error in updatePaymentStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to update payment status. Please try again'
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const result = await Order.delete(id);

        if (!result || result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to delete order. Please try again'
        });
    }
};

exports.getTotalRevenue = async (req, res) => {
    try {
        const totalRevenue = await Order.getTotalRevenue();

        res.status(200).json({
            success: true,
            message: 'Total revenue calculated successfully',
            data: {
                totalRevenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Error in getTotalRevenue:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to calculate revenue. Please try again'
        });
    }
};
