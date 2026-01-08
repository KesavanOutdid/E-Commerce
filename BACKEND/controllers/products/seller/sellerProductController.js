const Product = require('../../../models/Product');
const SellerProduct = require('../../../models/SellerProduct');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
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
        const limitNum = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limitNum;

        const query = {
            sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
        };

        console.log('Fetching listings for sellerId:', req.userId, 'Query:', query);

        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'productDetails'
                }
            },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limitNum }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const result = await SellerProduct.collection().aggregate(pipeline).toArray();

        const listings = await Promise.all(result[0].data.map(async (listing) => {
            const { productDetails, ...rest } = listing;

            const [mainCategory, subCategory] = await Promise.all([
                productDetails?.mainCategoryId ? MainCategory.findById(productDetails.mainCategoryId) : null,
                productDetails?.subCategoryId ? SubCategory.findById(productDetails.subCategoryId) : null
            ]);

            return {
                ...rest,
                userId: productDetails?.userId,
                productName: productDetails?.productName || 'Unknown Product',
                productImages: productDetails?.images || [],
                productDescription: productDetails?.description || '',
                productAttributes: productDetails?.attributes || [],
                productAvgRating: productDetails?.avgRating || 0,
                productSlug: productDetails?.slug || '',
                mainCategoryName: mainCategory ? mainCategory.name : null,
                subCategoryName: subCategory ? subCategory.name : null,
                commissionPercentage: subCategory?.commissionPercentage || 0,

            };
        }));

        const total = result[0].totalCount[0]?.count || 0;

        console.log('Found', total, 'listings, returning', listings.length, 'items');

        res.status(200).json({
            success: true,
            message: 'Seller listings fetched successfully',
            data: {
                listings,
                pagination: {
                    total,
                    page,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
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

exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

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
                    message: 'You can only delete your own listings'
                });
            }
        }

        await SellerProduct.delete(id);

        res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
