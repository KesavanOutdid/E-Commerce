const Product = require('../../../models/Product');
const SellerProduct = require('../../../models/SellerProduct');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const Order = require('../../../models/Order');
const { ObjectId } = require('mongodb');
const { getCache, setCache } = require('../../../services/redisService');
const { getDB } = require('../../../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Helper to get logged in user ID from token without full middleware
const getUserIdFromRequest = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};


// Helper for aggregation pipeline to avoid duplication and include marketplace offers
const getProductAggregationPipeline = (matchQuery, skip, limitNum, sortOptions = { minPrice: 1 }) => {
  return [
    { $match: matchQuery },
    // Join with marketplace listings and their seller details
    {
      $lookup: {
        from: "seller_products",
        let: { pid: "$productId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$pid"] }, approvalStatus: "approved" } },
          {
            $lookup: {
              from: "users",
              localField: "sellerId",
              foreignField: "userId",
              as: "user"
            }
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "sellers",
              localField: "sellerId",
              foreignField: "userId",
              as: "seller"
            }
          },
          { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              price: 1,
              salePrice: 1,
              stock: 1,
              deliveryDays: 1,
              sellerId: 1,
              sellerProductId: 1,
              productId: 1,
              currentPrice: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] },
              sellerName: { $concat: [{ $ifNull: ["$user.firstName", ""] }, " ", { $ifNull: ["$user.lastName", ""] }] },
              shopName: "$seller.shopName"
            }
          }
        ],
        as: "marketplaceListings"
      }
    },
    // Join main product seller details
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "userId",
        as: "mainUser"
      }
    },
    { $unwind: { path: "$mainUser", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "sellers",
        localField: "userId",
        foreignField: "userId",
        as: "mainSeller"
      }
    },
    { $unwind: { path: "$mainSeller", preserveNullAndEmptyArrays: true } },
    // Join with categories
    {
      $lookup: {
        from: "main_categories",
        localField: "mainCategoryId",
        foreignField: "categoryId",
        as: "mainCategory"
      }
    },
    { $unwind: { path: "$mainCategory", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "sub_categories",
        localField: "subCategoryId",
        foreignField: "subCategoryId",
        as: "subCategory"
      }
    },
    { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        mainCategoryName: "$mainCategory.name",
        subCategoryName: "$subCategory.name",
        mainPrice: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] },
        // Prepare list of all offers to identify min price and seller count
        allOffers: {
          $filter: {
            input: {
              $concatArrays: [
                [{
                  price: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] },
                  sellerId: "$userId",
                  sellerProductId: null,
                  productId: "$productId",
                  sellerName: { $cond: [{ $eq: ["$roleId", 1] }, "Admin", { $concat: [{ $ifNull: ["$mainUser.firstName", ""] }, " ", { $ifNull: ["$mainUser.lastName", ""] }] }] },
                  shopName: { $cond: [{ $eq: ["$roleId", 1] }, "Main Store", "$mainSeller.shopName"] },
                  stock: "$stock",
                  deliveryDays: { 
                    $cond: [
                      { $eq: ["$roleId", 1] }, 
                      { $ifNull: ["$deliveryDays", 7] }, 
                      { $ifNull: ["$deliveryDays", 5] }
                    ] 
                  }, 
                  isSeller: { $cond: [{ $eq: ["$roleId", 1] }, false, true] }
                }],
                { $map: {
                  input: "$marketplaceListings",
                  as: "m",
                  in: {
                    price: "$$m.currentPrice",
                    sellerId: "$$m.sellerId",
                    sellerProductId: "$$m.sellerProductId",
                    productId: "$$m.productId",
                    sellerName: "$$m.sellerName",
                    shopName: "$$m.shopName",
                    stock: "$$m.stock",
                    deliveryDays: "$$m.deliveryDays",
                    isSeller: true
                  }
                }}
              ]
            },
            as: "offer",
            cond: {
              $and: [
                { $gt: ["$$offer.price", 0] },
                { $gt: [{ $toInt: "$$offer.stock" }, 0] }
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        minPrice: { $min: "$allOffers.price" },
        sellerCount: {
          $size: {
            $filter: {
              input: "$allOffers",
              as: "o",
              cond: { $eq: ["$$o.isSeller", true] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        minPriceDetails: {
          $arrayElemAt: [
            { $filter: { input: "$allOffers", as: "o", cond: { $eq: ["$$o.price", "$minPrice"] } } },
            0
          ]
        }
      }
    },
    { $sort: sortOptions },
    {
      $group: {
        _id: "$slug",
        cheapestListing: { $first: "$$ROOT" }
      }
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              _id: 0,
              product: {
                $arrayToObject: {
                  $filter: {
                    input: { $objectToArray: "$cheapestListing" },
                    as: "kv",
                    cond: { 
                      $not: { 
                        $in: ["$$kv.k", ["mainUser", "mainSeller", "mainPrice", "mainCategory", "subCategory"]] 
                      } 
                    }
                  }
                }
              },
              sellerCount: "$cheapestListing.sellerCount"
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ];
};

// Fetch all approved products for website
exports.getProducts = async (req, res) => {
  try {
    const cacheKey = `products:list:website:all:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Products fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const { categoryId, search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter: Admin products (roleId 1) OR Approved Seller products (roleId 2)
    let matchQuery = { 
      $or: [
        { roleId: 1 },
        { roleId: 2, approvalStatus: 'approved' }
      ],
      status: { $in: [true, "true"] }
    };
    
    if (categoryId) matchQuery.mainCategoryId = categoryId;
    if (search) {
      matchQuery.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum)
    ).toArray();

    const products = aggregationResult[0].data;
    const total = aggregationResult[0].totalCount[0]?.count || 0;

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.product.isWishlisted = wishlist.includes(p.product.productId) || 
                               wishlist.includes(p.product._id?.toString());
      });
    }
    
    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
    
    // Cache the response if user is NOT logged in
    if (!userId) {
      await setCache(cacheKey, responseData, 3600);
    }

    res.status(200).json({ 
      success: true, 
      message: 'All approved products fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const cacheKey = `products:list:website:subcategory:${subCategoryId}:${page}:${limit}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Subcategory products fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let matchQuery = { 
      subCategoryId: subCategoryId,
      $or: [
        { roleId: 1 },
        { roleId: 2, approvalStatus: 'approved' }
      ],
      status: { $in: [true, "true"] }
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum)
    ).toArray();

    const products = aggregationResult[0].data;
    const total = aggregationResult[0].totalCount[0]?.count || 0;

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.product.isWishlisted = wishlist.includes(p.product.productId) || 
                               wishlist.includes(p.product._id?.toString());
      });
    }
    
    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
    
    // Cache the response if user is NOT logged in
    if (!userId) {
      await setCache(cacheKey, responseData, 3600);
    }

    res.status(200).json({ 
      success: true, 
      message: `Products for subcategory ${subCategoryId} fetched successfully`,
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `products:detail:website:${id}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Product details fetched successfully (from cache)',
        data: cachedData 
      });
    }

    // Filter: Specific ID + Approval/Status filters
    // Support both productId (UUID) and _id (ObjectId)
    let matchQuery = { 
      $and: [
        {
          $or: [
            { productId: id },
            ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
          ]
        },
        {
          $or: [
            { roleId: 1 },
            { roleId: 2, approvalStatus: 'approved' }
          ]
        },
        { status: { $in: [true, "true"] } }
      ]
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, 0, 1)
    ).toArray();

    if (!aggregationResult || !aggregationResult[0].data.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const responseData = aggregationResult[0].data[0];

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      responseData.product.isWishlisted = wishlist.includes(responseData.product.productId) || 
                                        wishlist.includes(id);
    }

    // Cache the response if user is NOT logged in
    if (!userId) {
      await setCache(cacheKey, responseData, 3600);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Product details fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const { categoryId, limit = 10, page = 1 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `products:best-sellers:${categoryId || 'all'}:${pageNum}:${limitNum}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Best sellers fetched successfully (from cache)',
        data: cachedData 
      });
    }

    // 1. Aggregate orders to find best selling products
    const orderItemsAggregation = [
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: { $toInt: { $ifNull: ["$items.quantity", 1] } } }
        }
      },
      { $sort: { orderCount: -1, totalQuantity: -1 } }
    ];

    const bestSellingProducts = await Order.collection().aggregate(orderItemsAggregation).toArray();
    const bestSellingIds = bestSellingProducts.map(p => p._id);

    // 2. Build match query for products
    let matchQuery = { 
      $or: [
        { roleId: 1 },
        { roleId: 2, approvalStatus: 'approved' }
      ],
      status: { $in: [true, "true"] }
    };
    
    if (categoryId) matchQuery.mainCategoryId = categoryId;
    
    // If we have best sellers from orders, we prioritize them
    if (bestSellingIds.length > 0) {
      matchQuery.productId = { $in: bestSellingIds };
    }

    // Sort by orderCount if applicable, otherwise fallback to reviews
    // Since getProductAggregationPipeline doesn't know about orderCount, 
    // we'll handle sorting by matching the order of bestSellingIds or just using the pipeline's sort.
    const sortOptions = { totalReviews: -1, avgRating: -1 };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, sortOptions)
    ).toArray();

    let products = aggregationResult[0].data;
    const total = aggregationResult[0].totalCount[0]?.count || 0;

    // If we have bestSellingIds, sort the resulting products to match the order of sales
    if (bestSellingIds.length > 0) {
      const orderMap = new Map();
      bestSellingIds.forEach((id, index) => orderMap.set(id, index));
      
      products.sort((a, b) => {
        const indexA = orderMap.has(a.product.productId) ? orderMap.get(a.product.productId) : 9999;
        const indexB = orderMap.has(b.product.productId) ? orderMap.get(b.product.productId) : 9999;
        return indexA - indexB;
      });
    }

    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.product.isWishlisted = wishlist.includes(p.product.productId) || 
                               wishlist.includes(p.product._id?.toString());
      });
    }
    
    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
    
    if (!userId) {
      await setCache(cacheKey, responseData, 3600);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Best sellers based on orders fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const searchQuery = query.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = `products:search:${searchQuery}:${pageNum}:${limitNum}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Search results fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const searchRegex = { $regex: searchQuery, $options: 'i' };
    const responseData = {
      products: [],
      pagination: {}
    };

    // Search in Main and Sub Categories to get their product IDs
    const matchingCategories = await getDB().collection('main_categories').find({
      name: searchRegex
    }).toArray();

    const matchingSubCategories = await getDB().collection('sub_categories').find({
      name: searchRegex
    }).toArray();

    const categoryIds = matchingCategories.map(cat => cat.categoryId);
    const subCategoryIds = matchingSubCategories.map(subCat => subCat.subCategoryId);

    // Build product search query - search by product name, description, or matching category/subcategory
    let matchQuery = {
      $and: [
        {
          $or: [
            { productName: searchRegex },
            { description: searchRegex },
            { shortDescription: searchRegex },
            { sku: searchRegex },
            ...(categoryIds.length > 0 ? [{ mainCategoryId: { $in: categoryIds } }] : []),
            ...(subCategoryIds.length > 0 ? [{ subCategoryId: { $in: subCategoryIds } }] : [])
          ]
        },
        {
          $or: [
            { roleId: 1 },
            { roleId: 2, approvalStatus: 'approved' }
          ]
        },
        { status: { $in: [true, "true"] } }
      ]
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, { minPrice: 1 })
    ).toArray();

    responseData.products = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;

    responseData.pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    };

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      responseData.products.forEach(p => {
        p.product.isWishlisted = wishlist.includes(p.product.productId) || 
                               wishlist.includes(p.product._id?.toString());
      });
    }

    // Cache the response if user is NOT logged in
    if (!userId) {
      await setCache(cacheKey, responseData, 1800);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Search results fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(200).json({ 
        success: true, 
        message: 'No suggestions for empty query',
        data: []
      });
    }

    const searchQuery = query.trim();
    const cacheKey = `products:suggestions:${searchQuery}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Suggestions fetched from cache',
        data: cachedData 
      });
    }

    const searchRegex = { $regex: searchQuery, $options: 'i' };

    // Get matching categories and subcategories to include their products
    const matchingCategories = await getDB().collection('main_categories')
      .find({ name: searchRegex })
      .toArray();

    const matchingSubCategories = await getDB().collection('sub_categories')
      .find({ name: searchRegex })
      .toArray();

    const categoryIds = matchingCategories.map(cat => cat.categoryId);
    const subCategoryIds = matchingSubCategories.map(subCat => subCat.subCategoryId);

    // Get matching products (top 10)
    const matchingProducts = await Product.collection()
      .find({
        $and: [
          {
            $or: [
              { productName: searchRegex },
              { description: searchRegex },
              { shortDescription: searchRegex },
              { sku: searchRegex },
              ...(categoryIds.length > 0 ? [{ mainCategoryId: { $in: categoryIds } }] : []),
              ...(subCategoryIds.length > 0 ? [{ subCategoryId: { $in: subCategoryIds } }] : [])
            ]
          },
          {
            $or: [
              { roleId: 1 },
              { roleId: 2, approvalStatus: 'approved' }
            ]
          },
          { status: { $in: [true, "true"] } }
        ]
      })
      .project({
        productId: 1,
        productName: 1,
        slug: 1,
        image: 1
      })
      .limit(10)
      .toArray();

    const suggestions = matchingProducts.map(prod => ({
      productId: prod.productId,
      productName: prod.productName,
      slug: prod.slug,
      image: prod.image || null
    }));

    // Cache suggestions for 30 minutes
    await setCache(cacheKey, suggestions, 1800);

    res.status(200).json({ 
      success: true, 
      message: 'Suggestions fetched successfully',
      data: suggestions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
