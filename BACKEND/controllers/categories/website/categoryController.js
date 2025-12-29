const Category = require('../../../models/Category');
const CategoryAttribute = require('../../../models/CategoryAttribute');
const { getCache, setCache } = require('../../../services/redisService');

exports.getCategories = async (req, res) => {
  try {
    const cacheKey = `categories:list:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Categories fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const { page = 1, limit = 10, ...filters } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { ...filters, status: true };

    const [categories, total] = await Promise.all([
      Category.find(query, { skip, limit: limitNum }),
      Category.count(query)
    ]);
    
    const responseData = {
      categories,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };

    await setCache(cacheKey, responseData, 3600); // Cache for 1 hour

    res.status(200).json({ 
      success: true, 
      message: 'Categories fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const cacheKey = `categories:detail:${req.params.id}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json({ 
        success: true, 
        message: 'Category fetched successfully (from cache)',
        data: cachedData 
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const attributes = await CategoryAttribute.findByCategoryId(req.params.id);
    const data = { ...category, attributes };

    await setCache(cacheKey, data, 3600);

    res.status(200).json({ 
      success: true, 
      message: 'Category fetched successfully',
      data 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
