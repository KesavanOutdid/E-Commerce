const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
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

    const { page = 1, limit = 10, type = 'main', ...filters } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { 
      $or: [
        { status: true },
        { status: 'true' }
      ],
      ...filters 
    };
    const Model = type === 'sub' ? SubCategory : MainCategory;

    const [categories, total] = await Promise.all([
      Model.find(query, { skip, limit: limitNum }),
      Model.count(query)
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

    await setCache(cacheKey, responseData, 300); // Cache for 5 minutes

    res.status(200).json({ 
      success: true, 
      message: 'Categories fetched successfully',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getSubcategoriesByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const parent = await MainCategory.findById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }
    
    const subcategories = await SubCategory.find({ parentId: parent.categoryId, status: true });
    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategoryAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await SubCategory.findById(id);

    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Attributes fetched successfully',
      data: subcategory.attributes || [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
