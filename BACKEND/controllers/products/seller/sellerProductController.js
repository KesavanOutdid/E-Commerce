const SellerProduct = require('../../../models/SellerProduct');
const Product = require('../../../models/Product');
const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
const { deleteCachePattern } = require('../../../services/redisService');
const { ObjectId } = require('mongodb');

exports.listProduct = async (req, res) => {
    try {
        if (req.roleId !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can list products'
            });
        }

        const { productId, price, salePrice, stock, deliveryDays } = req.body;

        if (!productId || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'productId, price, and stock are required'
            });
        }

        // Check if product exists in catalog
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in catalog'
            });
        }

        // Check if seller already listed this product
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
            approvalStatus: 'approved'
        };

        const sellerProduct = await SellerProduct.create(sellerProductData);

        await deleteCachePattern('products:list:*');

        res.status(201).json({
            success: true,
            message: 'Product listed successfully',
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
                subCategoryName: subCategory ? subCategory.name : null
            };
        }));

        const total = result[0].totalCount[0]?.count || 0;

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



exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await SellerProduct.findById(id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (listing.sellerId.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const updatedListing = await SellerProduct.update(id, req.body);

        await deleteCachePattern('products:list:*');

        res.status(200).json({
            success: true,
            message: 'Listing updated successfully',
            data: updatedListing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchSellerListings = async (req, res) => {
    try {
        const { search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limitNum;

        const query = {
            sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
        };

        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'productDetails'
                }
            },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } }
        ];

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { 'productDetails.productName': searchRegex },
                        { 'productDetails.productId': searchRegex },
                        { productId: search.trim() }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limitNum }],
                totalCount: [{ $count: 'count' }]
            }
        });

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
                mainCategoryId: productDetails?.mainCategoryId || null,
                subCategoryId: productDetails?.subCategoryId || null
            };
        }));

        const total = result[0].totalCount[0]?.count || 0;

        res.status(200).json({
            success: true,
            message: 'Search results fetched successfully',
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
