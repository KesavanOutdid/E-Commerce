const Product = require('../../../models/Product');
const ProductVariant = require('../../../models/ProductVariant');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const Order = require('../../../models/Order');
const { ObjectId } = require('mongodb');
const { getCache, setCache } = require('../../../services/redisService');
const { getDB } = require('../../../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Helper to get admin user ID dynamically
const getAdminId = async () => {
  const adminUser = await User.collection().findOne({ roles: 1 });
  return adminUser ? (adminUser.userId || adminUser._id.toString()) : null;
};

// Helper to get logged in user ID from token without full middleware
const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

// Helper for aggregation pipeline to avoid duplication and include marketplace offers
const getProductAggregationPipeline = (matchQuery, skip, limitNum, sortOptions = { minPrice: 1 }, filters = {}) => {
  const pipeline = [
    { $match: matchQuery },
    // Join with product variants and their seller details
    {
      $lookup: {
        from: "product_variants",
        let: { pid: "$productId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$pid"] }, approvalStatus: "approved", status: true } },
          
          // Attribute filtering inside the variant lookup
          ...(filters.attributes ? Object.keys(filters.attributes).map(attrName => ({
            $match: {
              attributes: {
                $elemMatch: {
                  name: attrName,
                  value: { $in: Array.isArray(filters.attributes[attrName]) ? filters.attributes[attrName] : [filters.attributes[attrName]] }
                }
              }
            }
          })) : []),

          {
            $lookup: {
              from: "users",
              let: { sid: "$sellerId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$userId", "$$sid"] },
                        { $eq: ["$_id", { $cond: [{ $eq: [{ $type: "$$sid" }, "objectId"] }, "$$sid", null] }] }
                      ]
                    }
                  }
                }
              ],
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
              _id: 1,
              price: 1,
              salePrice: 1,
              stock: 1,
              deliveryDays: 1,
              sellerId: 1,
              variantId: 1,
              productId: 1,
              attributes: 1,
              images: 1,
              currentPrice: { $cond: [{ $and: [{ $ne: ["$salePrice", null] }, { $gt: ["$salePrice", 0] }] }, "$salePrice", "$price"] },
              sellerName: {
                $cond: [
                  { $or: [{ $eq: ["$user.roleId", 1] }, { $in: [1, { $ifNull: ["$user.roles", []] }] }] },
                  "Admin",
                  { $trim: { input: { $concat: [{ $ifNull: ["$user.firstName", ""] }, " ", { $ifNull: ["$user.lastName", ""] }] } } }
                ]
              },
              shopName: {
                $cond: [
                  { $or: [{ $eq: ["$user.roleId", 1] }, { $in: [1, { $ifNull: ["$user.roles", []] }] }] },
                  "Outdid",
                  "$seller.shopName"
                ]
              }
            }
          }
        ],
        as: "variants"
      }
    },
    // Filter out products with no approved variants
    { $match: { "variants.0": { $exists: true } } },
    
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
        minPrice: { $min: "$variants.currentPrice" },
        maxPrice: { $max: "$variants.currentPrice" },
        totalStock: { $sum: "$variants.stock" },
        sellerCount: { $size: "$variants" }
      }
    },
    
    // Price Range Filter
    ...(filters.minPrice || filters.maxPrice ? [{
      $match: {
        minPrice: {
          ...(filters.minPrice ? { $gte: parseFloat(filters.minPrice) } : {}),
          ...(filters.maxPrice ? { $lte: parseFloat(filters.maxPrice) } : {})
        }
      }
    }] : []),

    // Rating Filter
    ...(filters.rating ? [{
      $match: {
        avgRating: { $gte: parseFloat(filters.rating) }
      }
    }] : []),

    {
      $addFields: {
        minPriceDetails: {
          $arrayElemAt: [
            { $filter: { input: "$variants", as: "v", cond: { $eq: ["$$v.currentPrice", "$minPrice"] } } },
            0
          ]
        }
      }
    },
    { $sort: sortOptions },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              mainCategory: 0,
              subCategory: 0,
              minPrice: 0,
              maxPrice: 0,
              totalStock: 0,
              sellerCount: 0
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ];
  return pipeline;
};

// Fetch all approved products for website
exports.getProducts = async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 12, brands, minPrice, maxPrice, rating, ...otherFilters } = req.query;
    
    const cacheKey = `products:list:website:all:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Products fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter: Admin products (roleId 1) OR Approved Seller products (roleId 2)
    let matchQuery = { 
      $and: [
        {
          $or: [
            { roleId: 1 },
            { roleId: 2, approvalStatus: 'approved' }
          ]
        },
        { status: { $in: [true, "true"] } }
      ]
    };
    
    if (categoryId) matchQuery.$and.push({ mainCategoryId: categoryId });
    if (search) {
      matchQuery.$and.push({
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (brands) {
      const brandList = Array.isArray(brands) ? brands : brands.split(',');
      matchQuery.$and.push({ brand: { $in: brandList } });
    }

    // Extract attributes from otherFilters
    const attributes = {};
    Object.keys(otherFilters).forEach(key => {
      if (!['page', 'limit', 'sort'].includes(key)) {
        attributes[key] = Array.isArray(otherFilters[key]) ? otherFilters[key] : otherFilters[key].split(',');
      }
    });

    const filters = {
      minPrice,
      maxPrice,
      rating,
      attributes: Object.keys(attributes).length > 0 ? attributes : null
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, { minPrice: 1 }, filters)
    ).toArray();

    const products = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.isWishlisted = wishlist.includes(p.productId) || 
                         wishlist.includes(p._id?.toString());
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
    const { page = 1, limit = 12, brands, minPrice, maxPrice, rating, ...otherFilters } = req.query;
    
    const cacheKey = `products:list:website:subcategory:${subCategoryId}:${JSON.stringify(req.query)}`;
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

    if (brands) {
      const brandList = Array.isArray(brands) ? brands : brands.split(',');
      matchQuery.brand = { $in: brandList };
    }

    // Extract attributes
    const attributes = {};
    Object.keys(otherFilters).forEach(key => {
      if (!['page', 'limit', 'sort'].includes(key)) {
        attributes[key] = Array.isArray(otherFilters[key]) ? otherFilters[key] : otherFilters[key].split(',');
      }
    });

    const filters = {
      minPrice,
      maxPrice,
      rating,
      attributes: Object.keys(attributes).length > 0 ? attributes : null
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, { minPrice: 1 }, filters)
    ).toArray();

    const products = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.isWishlisted = wishlist.includes(p.productId) || 
                         wishlist.includes(p._id?.toString());
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
    const { variantId } = req.query;

    const cacheKey = `products:detail:website:${id}:${variantId || 'default'}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Product details fetched successfully (from cache)',
        data: cachedData 
        });
    }

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
      getProductAggregationPipeline(matchQuery, 0, 1, { minPrice: 1 })
    ).toArray();

    if (!aggregationResult || !aggregationResult[0].data.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productData = aggregationResult[0].data[0];
    const allVariants = productData.variants || [];

    // 1. Extract unique attribute options across all variants (Only required ones)
    const attributeOptions = {};
    allVariants.forEach(v => {
      if (v.attributes && Array.isArray(v.attributes)) {
        v.attributes.forEach(attr => {
          if (attr.required === true) {
            if (!attributeOptions[attr.name]) {
              attributeOptions[attr.name] = new Set();
            }
            attributeOptions[attr.name].add(attr.value);
          }
        });
      }
    });

    // Convert Sets to Arrays for the response
    Object.keys(attributeOptions).forEach(key => {
      attributeOptions[key] = Array.from(attributeOptions[key]);
    });

    let selectedVariant = null;
    if (variantId) {
      selectedVariant = allVariants.find(v => v.variantId === variantId || v._id?.toString() === variantId);
    }

    if (!selectedVariant) {
      selectedVariant = productData.minPriceDetails;
    }

    // Add attributeSummary to the selected variant (Only required ones)
    if (selectedVariant && selectedVariant.attributes) {
      selectedVariant.attributeSummary = selectedVariant.attributes
        .filter(a => a.required === true)
        .map(a => `${a.value}${a.name === 'RAM' || a.name === 'Storage' ? 'GB' : ''} ${a.name}`)
        .join(", ");
    }

    const allOffers = allVariants.sort((a, b) => a.currentPrice - b.currentPrice);

    const responseData = {
      product: {
        ...productData,
        attributeOptions, // Add attributeOptions here
        variants: undefined,
        minPriceDetails: undefined
      },
      selectedVariant,
      allOffers
    };

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      responseData.product.isWishlisted = wishlist.includes(productData.productId) || 
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
    let bestSellingIds = [];
    try {
      const orderItemsAggregation = [
        { $unwind: "$items" },
        // Join with products to filter by category if categoryId is provided
        ...(categoryId ? [
          {
            $lookup: {
              from: "products",
              localField: "items.productId",
              foreignField: "productId",
              as: "productInfo"
            }
          },
          { $unwind: "$productInfo" },
          { $match: { "productInfo.mainCategoryId": categoryId } }
        ] : []),
        {
          $group: {
            _id: "$items.productId",
            orderCount: { $sum: 1 },
            totalQuantity: { $sum: { $toInt: { $ifNull: ["$items.quantity", 1] } } }
          }
        },
        { $sort: { orderCount: -1, totalQuantity: -1 } },
        { $limit: 100 }
      ];

      const bestSellingProducts = await Order.collection().aggregate(orderItemsAggregation).toArray();
      bestSellingIds = bestSellingProducts.map(p => p._id);
    } catch (orderError) {
      console.error("Error aggregating best sellers from orders:", orderError);
    }

    // 2. Build match query for products
    let matchQuery = { 
      $and: [
        {
          $or: [
            { roleId: 1 },
            { roleId: 2, approvalStatus: 'approved' }
          ]
        },
        { status: { $in: [true, "true"] } }
      ]
    };
    
    if (categoryId) matchQuery.$and.push({ mainCategoryId: categoryId });
    
    // If we have best sellers from orders, we prioritize them
    if (bestSellingIds.length > 0) {
      matchQuery.$and.push({ productId: { $in: bestSellingIds } });
    }

    const sortOptions = { totalReviews: -1, avgRating: -1 };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, sortOptions)
    ).toArray();

    let products = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;

    // If we have bestSellingIds, sort the resulting products to match the order of sales
    if (bestSellingIds.length > 0 && products.length > 0) {
      const orderMap = new Map();
      bestSellingIds.forEach((id, index) => orderMap.set(id, index));
      
      products.sort((a, b) => {
        const indexA = orderMap.has(a.productId) ? orderMap.get(a.productId) : 9999;
        const indexB = orderMap.has(b.productId) ? orderMap.get(b.productId) : 9999;
        return indexA - indexB;
      });
    }

    const userId = getUserIdFromRequest(req);
    if (userId && products.length > 0) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.isWishlisted = wishlist.includes(p.productId) || 
                         wishlist.includes(p._id?.toString());
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
    const { query, page = 1, limit = 10, brands, minPrice, maxPrice, rating, ...otherFilters } = req.query;

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

    const cacheKey = `products:search:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Search results fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const searchRegex = { $regex: searchQuery, $options: 'i' };
    
    // Search in Main and Sub Categories to get their product IDs
    const matchingCategories = await getDB().collection('main_categories').find({
      name: searchRegex
    }).toArray();

    const matchingSubCategories = await getDB().collection('sub_categories').find({
      name: searchRegex
    }).toArray();

    const categoryIds = matchingCategories.map(cat => cat.categoryId);
    const subCategoryIds = matchingSubCategories.map(subCat => subCat.subCategoryId);

    // Build product search query
    let matchQuery = {
      $and: [
        {
          $or: [
            { productName: searchRegex },
            { description: searchRegex },
            { shortDescription: searchRegex },
            { brand: searchRegex },
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

    if (brands) {
      const brandList = Array.isArray(brands) ? brands : brands.split(',');
      matchQuery.$and.push({ brand: { $in: brandList } });
    }

    // Extract attributes
    const attributes = {};
    Object.keys(otherFilters).forEach(key => {
      if (!['page', 'limit', 'sort'].includes(key)) {
        attributes[key] = Array.isArray(otherFilters[key]) ? otherFilters[key] : otherFilters[key].split(',');
      }
    });

    const filters = {
      minPrice,
      maxPrice,
      rating,
      attributes: Object.keys(attributes).length > 0 ? attributes : null
    };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, { minPrice: 1 }, filters)
    ).toArray();

    const products = aggregationResult[0]?.data || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;

    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      products.forEach(p => {
        p.isWishlisted = wishlist.includes(p.productId) || 
                         wishlist.includes(p._id?.toString());
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

exports.getFilterMetaData = async (req, res) => {
  try {
    const { categoryId, subCategoryId, search } = req.query;
    
    // Build context-aware match query
    let matchQuery = { 
      $and: [
        {
          $or: [
            { roleId: 1 },
            { roleId: 2, approvalStatus: 'approved' }
          ]
        },
        { status: { $in: [true, "true"] } }
      ]
    };
    
    if (categoryId) matchQuery.$and.push({ mainCategoryId: categoryId });
    if (subCategoryId) matchQuery.$and.push({ subCategoryId: subCategoryId });
    if (search) {
      matchQuery.$and.push({
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Pipeline to get metadata
    const metadataPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "product_variants",
          localField: "productId",
          foreignField: "productId",
          as: "variants"
        }
      },
      { $unwind: "$variants" },
      { $match: { "variants.approvalStatus": "approved", "variants.status": true } },
      {
        $addFields: {
          "variants.currentPrice": { 
            $cond: [{ $and: [{ $ne: ["$variants.salePrice", null] }, { $gt: ["$variants.salePrice", 0] }] }, "$variants.salePrice", "$variants.price"] 
          }
        }
      },
      {
        $group: {
          _id: null,
          brands: { $addToSet: "$brand" },
          minPrice: { $min: "$variants.currentPrice" },
          maxPrice: { $max: "$variants.currentPrice" },
          attributes: { $push: "$variants.attributes" },
          avgRating: { $avg: "$avgRating" }
        }
      }
    ];

    const result = await Product.collection().aggregate(metadataPipeline).toArray();
    
    if (!result || result.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          brands: [],
          priceRange: { min: 0, max: 0 },
          attributes: {},
          ratings: [4, 3, 2, 1]
        }
      });
    }

    const data = result[0];
    
    // Process attributes into unique sets
    const processedAttributes = {};
    if (data.attributes) {
      data.attributes.forEach(attrList => {
        if (Array.isArray(attrList)) {
          attrList.forEach(attr => {
            if (!processedAttributes[attr.name]) {
              processedAttributes[attr.name] = new Set();
            }
            processedAttributes[attr.name].add(attr.value);
          });
        }
      });
    }

    // Convert Sets to Arrays
    Object.keys(processedAttributes).forEach(key => {
      processedAttributes[key] = Array.from(processedAttributes[key]);
    });

    // Get Subcategories if only Main Category is provided
    let subCategories = [];
    if (categoryId && !subCategoryId) {
      subCategories = await getDB().collection('sub_categories')
        .find({ categoryId: categoryId })
        .project({ name: 1, subCategoryId: 1 })
        .toArray();
    }

    res.status(200).json({
      success: true,
      data: {
        brands: data.brands.filter(b => b),
        priceRange: { 
          min: Math.floor(data.minPrice || 0), 
          max: Math.ceil(data.maxPrice || 0) 
        },
        attributes: processedAttributes,
        ratings: [4, 3, 2, 1],
        subCategories: subCategories.map(s => ({ id: s.subCategoryId, name: s.name }))
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
