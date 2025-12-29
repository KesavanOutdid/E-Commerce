const Product = require('../../../models/Product');
const { getCache, setCache } = require('../../../services/redisService');

exports.getProducts = async (req, res) => {
  try {
    const cacheKey = `products:list:website:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Products fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const { categoryId, subCategoryId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let matchQuery = { 
      approvalStatus: 'approved',
      status: true 
    };
    
    if (categoryId) matchQuery.categoryId = categoryId;
    if (subCategoryId) matchQuery.subCategoryId = subCategoryId;

    // Use aggregation to group by slug (Master Product Identity)
    // and pick the cheapest seller for the list view, with pagination
    const aggregationResult = await Product.collection().aggregate([
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
    ]).toArray();

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
      message: 'Products fetched successfully',
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
    if (!product || product.approvalStatus !== 'approved' || product.status !== true) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find all other sellers for the same product using slug
    const otherSellers = await Product.collection().find({
      slug: product.slug,
      _id: { $ne: product._id },
      approvalStatus: 'approved',
      status: true
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
