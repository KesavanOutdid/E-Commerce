const Product = require('../../../models/Product');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const { ObjectId } = require('mongodb');
const { getCache, setCache } = require('../../../services/redisService');
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


// Helper for aggregation pipeline to avoid duplication
const getProductAggregationPipeline = (matchQuery, skip, limitNum, sortOptions = { price: 1 }) => {
  return [
    { $match: matchQuery },
    { $sort: sortOptions },
    { 
      $group: {
        _id: "$slug",
        cheapestListing: { $first: "$$ROOT" },
        sellerCount: { $sum: 1 },
        minPrice: { $min: "$price" }
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
              product: "$cheapestListing",
              sellerCount: 1,
              minPrice: 1
            }
          }
        ],
        totalCount: [
          { $count: "count" }
        ]
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

    const { categoryId, page = 1, limit = 10 } = req.query;
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
    const cacheKey = `products:detail:website:${req.params.id}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Product details fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const product = await Product.findById(req.params.id);
    // Check if it's admin or approved seller product
    const isApproved = product && (product.roleId === 1 || (product.roleId === 2 && product.approvalStatus === 'approved'));
    const isActive = product && (product.status === true || product.status === "true");
    
    if (!product || !isApproved || !isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find all other sellers for the same product using slug
    const otherSellers = await Product.collection().find({
      slug: product.slug,
      _id: { $ne: product._id },
      $or: [
        { roleId: 1 },
        { roleId: 2, approvalStatus: 'approved' }
      ],
      status: { $in: [true, "true"] }
    }).toArray();

    // Fetch user details for the main product and other sellers
    const allSellerIds = [product.userId, ...otherSellers.map(s => s.userId)];
    const uniqueSellerIds = [...new Set(allSellerIds.filter(id => id))];
    
    const users = await User.collection().find({
      $or: [
        { userId: { $in: uniqueSellerIds } },
        { _id: { $in: uniqueSellerIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } }
      ]
    }).toArray();

    const sellers = await Seller.collection().find({
      userId: { $in: uniqueSellerIds }
    }).toArray();

    const userMap = new Map();
    users.forEach(u => {
      if (u.userId) userMap.set(u.userId.toString(), u);
      if (u._id) userMap.set(u._id.toString(), u);
    });

    const shopMap = new Map();
    sellers.forEach(s => {
      if (s.userId) shopMap.set(s.userId.toString(), s.shopName);
    });

    const getSellerDetails = (productUserId) => {
      if (!productUserId) return { sellerName: null, shopName: null };
      const user = userMap.get(productUserId.toString());
      if (!user) return { sellerName: null, shopName: null };

      return {
        sellerName: `${user.firstName} ${user.lastName}`.trim(),
        shopName: user.userId ? shopMap.get(user.userId.toString()) : null
      };
    };

    const otherSellersWithNames = otherSellers.map(seller => {
      const sellerData = { ...seller };
      if (seller.roleId === 2) {
        const { sellerName, shopName } = getSellerDetails(seller.userId);
        sellerData.sellerName = sellerName;
        sellerData.shopName = shopName;
      }
      return sellerData;
    });

    const responseData = {
      ...product,
      otherSellers: otherSellersWithNames
    };

    if (product.roleId === 2) {
      const { sellerName, shopName } = getSellerDetails(product.userId);
      responseData.sellerName = sellerName;
      responseData.shopName = shopName;
    }

    // Add isWishlisted flag if user is logged in
    const userId = getUserIdFromRequest(req);
    if (userId) {
      const wishlist = await User.getWishlist(userId);
      responseData.isWishlisted = wishlist.includes(product.productId) || 
                                 wishlist.includes(product._id?.toString());
    }

    // Cache if NOT logged in
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

    let matchQuery = { 
      $or: [
        { roleId: 1 },
        { roleId: 2, approvalStatus: 'approved' }
      ],
      status: { $in: [true, "true"] }
    };
    
    if (categoryId) matchQuery.mainCategoryId = categoryId;

    // Best sellers sorted by totalReviews and avgRating
    const sortOptions = { totalReviews: -1, avgRating: -1 };

    const aggregationResult = await Product.collection().aggregate(
      getProductAggregationPipeline(matchQuery, skip, limitNum, sortOptions)
    ).toArray();

    const products = aggregationResult[0].data;
    const total = aggregationResult[0].totalCount[0]?.count || 0;

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
      message: 'Best sellers fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
