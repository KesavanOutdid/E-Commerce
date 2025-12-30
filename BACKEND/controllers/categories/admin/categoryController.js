const Category = require('../../../models/Category');
const CategoryAttribute = require('../../../models/CategoryAttribute');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, parentId, level, attributes, createdBy } = req.body;
    
    // Validation
    if (!name || !slug || level === undefined || createdBy === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, slug, level, and createdBy are required fields' 
      });
    }
    
    // Level 2+ requires parentId
    if (level > 1 && !parentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'parentId is required for subcategories (level 2+)' 
      });
    }
    
    // Validate parentId if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ 
          success: false, 
          message: 'Parent category not found' 
        });
      }
    }

    const categoryData = {
      name,
      slug,
      parentId,
      level,
      status: true,
      createdBy
    };

    const category = await Category.create(categoryData);

    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        await CategoryAttribute.create({
          categoryId: category._id,
          ...attr
        });
      }
    }

    // Invalidate categories cache
    await deleteCachePattern('categories:list:*');

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully',
      data: category 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, level, status, updatedBy } = req.body;

    // Check if body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    // Optional validations for specific fields if they are provided
    if (name !== undefined && !name) return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    if (slug !== undefined && !slug) return res.status(400).json({ success: false, message: 'Slug cannot be empty' });

    const updateData = {
      ...req.body
    };
    
    delete updateData.updatedBy;
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    const category = await Category.update(req.params.id, updateData);
    
    // Invalidate caches
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${req.params.id}`);
    if (category?.categoryId) await deleteCache(`categories:detail:${category.categoryId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Category updated successfully',
      data: category 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    await Category.delete(req.params.id);
    await CategoryAttribute.deleteByCategoryId(req.params.id);
    
    // Invalidate caches
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${req.params.id}`);
    if (category?.categoryId) await deleteCache(`categories:detail:${category.categoryId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Category and its attributes deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAttributes = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { attributes } = req.body;

    const results = [];
    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        const result = await CategoryAttribute.create({
          categoryId,
          ...attr
        });
        results.push(result);
      }
    }

    // Invalidate cache for this category
    await deleteCache(`categories:detail:${categoryId}`);

    res.status(201).json({ 
      success: true, 
      message: 'Attributes added successfully',
      data: results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
