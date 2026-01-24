const Order = require('../../models/Order');
const Payment = require('../../models/Payment');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');
const PriceHistory = require('../../models/PriceHistory');
const Coupon = require('../../models/Coupon');
const SubCategory = require('../../models/SubCategory');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const isValidRazorpayConfig = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) return false;
    if (keyId.includes('your_') || keyId.includes('here')) return false;
    if (keySecret.includes('your_') || keySecret.includes('here')) return false;
    if (keyId.length < 10 || keySecret.length < 10) return false;

    return true;
};

const razorpay = isValidRazorpayConfig()
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    : null;

const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';

async function validateCoupon(couponCode, userId, orderTotal) {
    if (!couponCode) {
        return { valid: false, error: null, coupon: null };
    }

    const coupon = await Coupon.findByCode(couponCode);
    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code', coupon: null };
    }

    if (!coupon.status) {
        return { valid: false, error: 'This coupon is no longer active', coupon: null };
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
        return { valid: false, error: 'This coupon has expired', coupon: null };
    }

    if (orderTotal < coupon.minOrderValue) {
        return {
            valid: false,
            error: `Minimum order value of ₹${coupon.minOrderValue} required to use this coupon`,
            coupon: null
        };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: 'This coupon has reached its usage limit', coupon: null };
    }

    if (coupon.userLimit && coupon.userLimit > 0) {
        const userOrdersWithCoupon = await Order.collection().countDocuments({
            userId: userId,
            couponId: coupon.couponId,
            orderStatus: { $ne: 'cancelled' }
        });

        if (userOrdersWithCoupon >= coupon.userLimit) {
            return {
                valid: false,
                error: 'You have already used this coupon the maximum number of times',
                coupon: null
            };
        }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    }

    return {
        valid: true,
        error: null,
        coupon: coupon,
        discountAmount: discountAmount
    };
}

async function processPlatformFees(orderItems, orderId, paymentType) {
    const results = {
        totalPlatformFees: 0,
        sellerBreakdown: []
    };

    for (const item of orderItems) {
        try {
            let sellerId = null;
            let salePrice = 0;
            let commissionPercentage = 0;

            if (item.variantId) {
                const variant = await ProductVariant.findById(item.variantId);
                if (variant) {
                    sellerId = variant.sellerId;
                    salePrice = (variant.salePrice || variant.price) * item.qty;
                }
            }

            if (sellerId && salePrice > 0) {
                const product = await Product.findById(item.productId);
                if (product && product.subCategoryId) {
                    const subCategory = await SubCategory.findById(product.subCategoryId);
                    if (subCategory && subCategory.commissionPercentage) {
                        commissionPercentage = subCategory.commissionPercentage;
                    }
                }

                const platformFee = (salePrice * commissionPercentage) / 100;
                const sellerEarnings = salePrice - platformFee;

                await User.addSellerEarnings(sellerId.toString(), sellerEarnings);

                await PriceHistory.create({
                    userId: sellerId.toString(),
                    type: 'seller_earning',
                    orderId: orderId,
                    productId: item.productId,
                    variantId: item.variantId,
                    sellerId: sellerId.toString(),
                    amount: sellerEarnings,
                    salePrice: salePrice,
                    platformFee: platformFee,
                    paymentType: paymentType
                });

                results.totalPlatformFees += platformFee;
                results.sellerBreakdown.push({
                    sellerId: sellerId.toString(),
                    productId: item.productId,
                    variantId: item.variantId,
                    salePrice: salePrice,
                    platformFee: platformFee,
                    sellerEarnings: sellerEarnings,
                    commissionPercentage: commissionPercentage
                });
            }
        } catch (error) {
            console.error(`Error processing platform fees for item ${item.productId}:`, error);
        }
    }

    if (results.totalPlatformFees > 0) {
        try {
            await User.addPlatformFees(ADMIN_USER_ID, results.totalPlatformFees);

            await PriceHistory.create({
                userId: ADMIN_USER_ID,
                type: 'platform_fee',
                orderId: orderId,
                productId: null,
                variantId: null,
                sellerId: null,
                amount: results.totalPlatformFees,
                salePrice: null,
                platformFee: results.totalPlatformFees,
                paymentType: paymentType
            });
        } catch (error) {
            console.error('Error updating admin platform fees:', error);
        }
    }

    return results;
}

exports.createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        let { deliveryAddress, paymentType, totalPrice, gst, subTotal, grandTotal, productIds, shippingFees, codFees, time, couponCode, couponId: reqCouponId, discountAmount, offerId, offerCode, offerDiscount } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to place an order'
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a delivery address'
            });
        }

        const requiredAddressFields = ['name', 'phone', 'doorNo', 'street', 'city', 'state', 'pincode'];
        const missingFields = requiredAddressFields.filter(field => !deliveryAddress[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please provide complete delivery address. Missing: ${missingFields.join(', ')}`
            });
        }

        if (deliveryAddress.phone && !/^\d{10}$/.test(deliveryAddress.phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit phone number'
            });
        }

        if (deliveryAddress.pincode && !/^\d{6}$/.test(deliveryAddress.pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit pincode'
            });
        }

        if (!paymentType) {
            return res.status(400).json({
                success: false,
                message: 'Please select a payment method (cod or online)'
            });
        }

        paymentType = paymentType.toLowerCase();

        if (!['cod', 'online'].includes(paymentType)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid payment method (cod or online)'
            });
        }

        if (paymentType === 'online' && !razorpay) {
            return res.status(400).json({
                success: false,
                message: 'Online payment is currently unavailable. Please use Cash on Delivery'
            });
        }

        if (totalPrice === undefined || gst === undefined || subTotal === undefined || grandTotal === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Price information is missing. Please try again'
            });
        }

        const user = await User.findByUserId(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Account not found. Please log in again'
            });
        }

        const cart = await Cart.findByUserId(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Please add items before checkout'
            });
        }

        let selectedItems = cart.items;

        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            selectedItems = cart.items.filter(item =>
                productIds.includes(item.productId) ||
                (item.variantId && productIds.includes(item.variantId))
            );

            if (selectedItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'None of the selected products are in your cart'
                });
            }

            if (selectedItems.length !== productIds.length) {
                const foundIds = selectedItems.reduce((acc, item) => {
                    acc.push(item.productId);
                    if (item.variantId) acc.push(item.variantId);
                    return acc;
                }, []);
                const missingIds = productIds.filter(id => !foundIds.includes(id));
                return res.status(400).json({
                    success: false,
                    message: `Some products are not in your cart`,
                    missingProductIds: missingIds
                });
            }
        }

        for (const item of selectedItems) {
            if (item.variantId) {
                const variant = await ProductVariant.findById(item.variantId);
                if (!variant) {
                    return res.status(404).json({ success: false, message: `Variant for ${item.productName} not found` });
                }
                if (variant.stock < item.qty) {
                    return res.status(400).json({ success: false, message: `Only ${variant.stock} items available for ${item.productName}` });
                }
            } else {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: `Product ${item.productName} is no longer available` });
                }
                if (product.stock < item.qty) {
                    return res.status(400).json({ success: false, message: `Only ${product.stock} items available for ${item.productName}` });
                }
            }
        }

        const finalCodFees = codFees || 0;
        const finalShippingFees = shippingFees || 0;

        let validatedCoupon = null;
        let finalDiscountAmount = 0;
        let couponId = null;

        if (couponCode || reqCouponId) {
            const couponValidation = await validateCoupon(couponCode || reqCouponId, userId, subTotal);

            if (!couponValidation.valid) {
                return res.status(400).json({
                    success: false,
                    message: couponValidation.error
                });
            }

            validatedCoupon = couponValidation.coupon;
            finalDiscountAmount = couponValidation.discountAmount;
            couponId = validatedCoupon.couponId;
        } else if (discountAmount && discountAmount > 0) {
            finalDiscountAmount = discountAmount;
        }

        const finalGrandTotal = grandTotal;

        let razorpayOrder = null;
        if (paymentType === 'online') {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(finalGrandTotal * 100),
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`
                });
            } catch (razorpayError) {
                console.error('Razorpay order creation failed:', razorpayError);
                return res.status(400).json({
                    success: false,
                    message: 'Unable to process online payment at the moment. Please try Cash on Delivery or contact support'
                });
            }
        }

        const orderData = {
            userId: userId,
            userEmail: user.email,
            items: selectedItems,
            totalPrice: totalPrice,
            gst: gst,
            subTotal: subTotal,
            grandTotal: finalGrandTotal,
            codFees: finalCodFees,
            shippingFees: finalShippingFees,
            couponId: couponId,
            couponCode: couponCode || null,
            discountAmount: finalDiscountAmount,
            offerDiscount: offerDiscount || 0,
            offerId: offerId || null,
            offerCode: offerCode || null,
            deliveryAddress: deliveryAddress,
            paymentType: paymentType,
            paymentStatus: 'pending',
            orderStatus: paymentType === 'cod' ? 'confirmed' : 'pending',
            razorpayOrderId: razorpayOrder?.id || null,
            time: time || new Date(),
            createdBy: user.email,
            updatedBy: user.email
        };

        const order = await Order.create(orderData);

        const paymentData = {
            orderId: order.orderId,
            userId: userId,
            userEmail: user.email,
            razorpayOrderId: razorpayOrder?.id || null,
            totalPrice: totalPrice,
            gst: gst,
            subTotal: subTotal,
            grandTotal: finalGrandTotal,
            codFees: finalCodFees,
            shippingFees: finalShippingFees,
            paymentType: paymentType,
            paymentStatus: 'pending',
            createdBy: user.email,
            updatedBy: user.email
        };

        await Payment.create(paymentData);

        if (paymentType === 'cod') {
            for (const item of selectedItems) {
                try {
                    if (item.variantId) {
                        await ProductVariant.reduceStock(item.variantId, item.qty);
                    }
                } catch (stockError) {
                    console.error(`Stock reduction failed for ${item.productId}:`, stockError);
                    return res.status(400).json({
                        success: false,
                        message: `Unable to process order. ${stockError.message}`
                    });
                }
            }

            await processPlatformFees(selectedItems, order.orderId, paymentType);

            if (couponId) {
                try {
                    await Coupon.incrementUsage(couponId);
                } catch (couponError) {
                    console.error('Error incrementing coupon usage:', couponError);
                }
            }

            if (productIds && Array.isArray(productIds) && productIds.length > 0) {
                for (const item of selectedItems) {
                    await Cart.removeItem(userId, item.productId, item.variantId, user.email);
                }
            } else {
                await Cart.clearCart(userId);
            }
        }

        const responseData = {
            orderId: order.orderId,
            userId: userId,
            razorpayOrder: razorpayOrder,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            paymentType: paymentType,
            items: selectedItems,
            deliveryAddress: deliveryAddress,
            time: order.time,
            priceBreakdown: {
                totalPrice: totalPrice,
                gst: gst,
                subTotal: subTotal,
                codFees: finalCodFees,
                shippingFees: finalShippingFees,
                grandTotal: finalGrandTotal
            },
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus
        };

        if (paymentType === 'online' && razorpayOrder) {
            const testPaymentId = `pay_Test${Date.now()}`;
            const testSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpayOrder.id}|${testPaymentId}`)
                .digest('hex');

            responseData.testPaymentDetails = {
                razorpay_order_id: razorpayOrder.id,
                razorpay_payment_id: testPaymentId,
                razorpay_signature: testSignature,
                note: "FOR TESTING ONLY - Use these values to verify payment without frontend integration"
            };
        }

        return res.status(201).json({
            success: true,
            message: paymentType === 'cod'
                ? 'Order placed successfully!'
                : 'Order created. Please complete the payment',
            data: responseData
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while placing your order. Please try again or contact support'
        });
    }
};

exports.verifyOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.userId;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification details are missing'
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification is currently unavailable'
            });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        console.log('Signature Verification:', {
            received: razorpay_signature,
            expected: expectedSignature,
            match: expectedSignature === razorpay_signature,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id
        });

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. The payment signature does not match. Please contact support if payment was deducted'
            });
        }

        const user = await User.findByUserId(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Account not found. Please log in again'
            });
        }

        const order = await Order.findByRazorpayOrderId(razorpay_order_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        await Payment.updateByRazorpayOrderId(razorpay_order_id, {
            paymentStatus: 'completed',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            updatedBy: user.email
        });

        await Order.updatePaymentDetails(razorpay_order_id, {
            paymentStatus: 'completed',
            orderStatus: 'confirmed',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            updatedBy: user.email
        });

        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                try {
                    if (item.variantId) {
                        await ProductVariant.reduceStock(item.variantId, item.qty);
                    }
                } catch (stockError) {
                    console.error(`Stock reduction failed for ${item.productId}:`, stockError);
                }

                await Cart.removeItem(userId, item.productId, item.variantId, user.email);
            }

            await processPlatformFees(order.items, order.orderId, order.paymentType);

            if (order.couponId) {
                try {
                    await Coupon.incrementUsage(order.couponId);
                } catch (couponError) {
                    console.error('Error incrementing coupon usage:', couponError);
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully. Your order is confirmed!'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to verify your payment. Please contact support with your order details'
        });
    }
};

const enrichOrderWithPickupAddress = async (order) => {
    if (!order.items || order.items.length === 0) return order;

    const enrichedItems = await Promise.all(
        order.items.map(async (item) => {
            try {
                if (!item.variantId) return item;

                const variant = await ProductVariant.findById(item.variantId);
                if (!variant) return item;

                let pickupAddress = null;
                if (variant.pickupAddress && variant.sellerId) {
                    const seller = await User.findByUserId(variant.sellerId.toString());
                    if (seller && seller.pickupAddresses) {
                        const pickupAddr = seller.pickupAddresses.find(
                            addr => addr.id?.toString() === variant.pickupAddress.toString()
                        );
                        pickupAddress = pickupAddr || null;
                    }
                }

                const product = await Product.findById(item.productId);
                const finalImages = (variant?.images && variant.images.length > 0)
                    ? variant.images
                    : (product?.images || []);

                return {
                    ...item,
                    images: finalImages,
                    productImages: product?.images || [],
                    pickupAddress: pickupAddress,
                    variantDetails: {
                        variantId: variant.variantId,
                        attributes: variant.attributes,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        stock: variant.stock,
                        images: variant.images,
                        deliveryDays: variant.deliveryDays,
                        pickupAddress: pickupAddress
                    }
                };
            } catch (error) {
                console.error(`Error enriching item ${item.productId}:`, error);
                return item;
            }
        })
    );

    return {
        ...order,
        items: enrichedItems
    };
};

exports.getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        if (!userId) {
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

        const order = await Order.findByUserIdAndOrderId(userId, orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const enrichedOrder = await enrichOrderWithPickupAddress(order);

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

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to view your orders'
            });
        }

        const orders = await Order.findByUserId(userId, {
            limit: limit,
            skip: skip
        });
        const total = await Order.countByUserId(userId);
        const totalPages = Math.ceil(total / limit);

        if (orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'You have no orders yet. Start shopping!',
                data: [],
                pagination: {
                    total: 0,
                    page: page,
                    limit: limit,
                    pages: 0
                }
            });
        }

        const enrichedOrders = await Promise.all(
            orders.map(order => enrichOrderWithPickupAddress(order))
        );

        res.status(200).json({
            success: true,
            message: 'Your order history loaded successfully',
            data: enrichedOrders,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                pages: totalPages
            }
        });
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to load your orders. Please try again later'
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, paymentType, paymentStatus } = req.query;

        const filter = {};
        if (status) filter.orderStatus = status;
        if (paymentType) filter.paymentType = paymentType.toLowerCase();
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const orders = await Order.findAll({
            limit: limit,
            skip: skip,
            filter
        });

        const total = await Order.countAll(filter);
        const totalPages = Math.ceil(total / limit);

        const enrichedOrders = await Promise.all(
            orders.map(order => enrichOrderWithPickupAddress(order))
        );

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
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const order = await Order.updateOrderStatus(id, status, req.userEmail);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

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
        const revenue = await Order.getTotalRevenue();
        res.status(200).json({
            success: true,
            message: 'Revenue data retrieved successfully',
            data: { revenue }
        });
    } catch (error) {
        console.error('Error in getTotalRevenue:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve revenue data. Please try again'
        });
    }
};
