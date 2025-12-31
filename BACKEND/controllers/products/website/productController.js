const Product = require('../../../models/Product');
const { getCache, setCache } = require('../../../services/redisService');


// Helper for aggregation pipeline to avoid duplication
const getProductAggregationPipeline = (matchQuery, skip, limitNum) => {
  return [
    { $match: matchQuery },
    { $sort: { price: 1 } },
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
    
    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
    
    await setCache(cacheKey, responseData, 3600);

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
    
    const responseData = {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
    
    await setCache(cacheKey, responseData, 3600);

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

    const responseData = {
      ...product,
      otherSellers: otherSellers
    };

    await setCache(cacheKey, responseData, 3600);

    res.status(200).json({ 
      success: true, 
      message: 'Product details fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
