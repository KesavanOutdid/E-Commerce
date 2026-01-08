const Product = require('../../../models/Product');
const SellerProduct = require('../../../models/SellerProduct');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const { ObjectId } = require('mongodb');

exports.listProduct = async (req, res) => {
    try {
        const { productId, price, salePrice, stock, deliveryDays } = req.body;

        if (!productId || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'productId, price, and stock are required'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in catalog'
            });
        }

        const existingListing = await SellerProduct.collection().findOne({
            productId,
            sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
        });

        if (existingListing) {
            return res.status(409).json({
                success: false,
                message: 'You have already listed this product. Update the existing listing instead.'
            });
        }

        const sellerProductData = {
            productId,
            sellerId: req.userId,
            price,
            salePrice,
            stock,
            deliveryDays,
            approvalStatus: 'pending'
        };

        const sellerProduct = await SellerProduct.create(sellerProductData);

        res.status(201).json({
            success: true,
            message: 'Product listed successfully and sent for approval',
            data: sellerProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { status, approvalStatus } = req.query;

        const filter = {};
        
        if (req.roleId !== 1) {
            filter.sellerId = ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId;
        }
        
        if (status) filter.sellerStatus = status;
        if (approvalStatus) filter.approvalStatus = approvalStatus;

        const listings = await SellerProduct.find(filter, { skip, limit });
        const total = await SellerProduct.collection().countDocuments(filter);

        const productIds = listings.map(l => l.productId);
        const products = await Product.collection().find({ 
            productId: { $in: productIds } 
        }).toArray();

        const productMap = new Map();
        products.forEach(p => productMap.set(p.productId, p));

        const enrichedListings = listings.map(listing => ({
            ...listing,
            product: productMap.get(listing.productId) || null
        }));

        res.status(200).json({
            success: true,
            message: 'Listings retrieved successfully',
            data: enrichedListings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchSellerListings = async (req, res) => {
    try {
        const { search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        if (!search) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const filter = {};
        if (req.roleId !== 1) {
            filter.sellerId = ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId;
        }

        const listings = await SellerProduct.find(filter, { skip, limit });
        
        const productIds = listings.map(l => l.productId);
        const products = await Product.collection().find({
            productId: { $in: productIds },
            $or: [
                { productName: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ]
        }).toArray();

        const matchedProductIds = new Set(products.map(p => p.productId));
        const filteredListings = listings.filter(l => matchedProductIds.has(l.productId));
        
        const productMap = new Map();
        products.forEach(p => productMap.set(p.productId, p));

        const enrichedListings = filteredListings.map(listing => ({
            ...listing,
            product: productMap.get(listing.productId) || null
        }));

        res.status(200).json({
            success: true,
            message: 'Search results',
            data: enrichedListings,
            total: enrichedListings.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, salePrice, stock, deliveryDays, sellerStatus } = req.body;

        const listing = await SellerProduct.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        if (req.roleId !== 1) {
            const listingSellerId = listing.sellerId?.toString();
            const requestUserId = req.userId?.toString();
            
            if (listingSellerId !== requestUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own listings'
                });
            }
        }

        const updateData = {};
        if (price !== undefined) updateData.price = price;
        if (salePrice !== undefined) updateData.salePrice = salePrice;
        if (stock !== undefined) updateData.stock = stock;
        if (deliveryDays !== undefined) updateData.deliveryDays = deliveryDays;
        if (sellerStatus !== undefined) updateData.sellerStatus = sellerStatus;

        const updatedListing = await SellerProduct.update(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: updatedListing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
