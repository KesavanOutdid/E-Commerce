const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');
const { slugify } = require('../../../utils/help');

// --- MAIN CATEGORY APIs ---

exports.createMainCategory = async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    if (!name || !createdBy) {
      return res.status(400).json({ success: false, message: 'Name and createdBy are required' });
    }

    const slug = slugify(name);
    const existing = await MainCategory.find({ $or: [{ name }, { slug }] });
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Category already exists' });

    const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const category = await MainCategory.create({ name, slug, createdBy, image });
    await deleteCachePattern('categories:list:*');

    res.status(201).json({ success: true, message: 'Main category created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, updatedby } = req.body;

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Main category not found' });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (status !== undefined) updateData.status = status;
    if (updatedby) updateData.updatedby = updatedby;
    if (req.file) {
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    const updatedCategory = await MainCategory.update(id, updateData);
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${id}`);

    res.status(200).json({ success: true, message: 'Main category updated successfully', data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMainCategory = async (req, res) => {
  try {
    await MainCategory.delete(req.params.id);
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${req.params.id}`);
    res.status(200).json({ success: true, message: 'Main category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMainCategories = async (req, res) => {
  try {
    const categories = await MainCategory.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SUBCATEGORY APIs ---

exports.createSubcategory = async (req, res) => {
  try {
    const { name, parentId, level, createdBy, attributes } = req.body;
    if (!name || !parentId || !createdBy) {
      return res.status(400).json({ success: false, message: 'Name, parentId, and createdBy are required' });
    }

    const parent = await MainCategory.findById(parentId);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent category not found' });

    const slug = slugify(name);
    const existing = await SubCategory.find({ $or: [{ name }, { slug }] });
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Subcategory already exists' });

    const category = await SubCategory.create({ 
      name, slug, parentId: parent.categoryId, level: level || 2, createdBy, attributes: attributes || [] 
    });
    await deleteCachePattern('categories:list:*');

    res.status(201).json({ success: true, message: 'Subcategory created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, level, attributes, status } = req.body;

    const subcategory = await SubCategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (level) updateData.level = level;
    if (attributes) updateData.attributes = attributes;
    if (status !== undefined) updateData.status = status;

    if (parentId) {
      const parent = await MainCategory.findById(parentId);
      if (!parent) return res.status(404).json({ success: false, message: 'Parent category not found' });
      updateData.parentId = parent.categoryId;
    }

    const updatedSubcategory = await SubCategory.update(id, updateData);
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${id}`);

    res.status(200).json({ success: true, message: 'Subcategory updated successfully', data: updatedSubcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    await SubCategory.delete(req.params.id);
    await deleteCachePattern('categories:list:*');
    await deleteCache(`categories:detail:${req.params.id}`);
    res.status(200).json({ success: true, message: 'Subcategory deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcategoriesByParent = async (req, res) => {
  try {
    const parent = await MainCategory.findById(req.params.parentId);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    
    const subcategories = await SubCategory.find({ parentId: parent.categoryId, status: true });
    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSubcategoryAttributes = async (req, res) => {
  try {
    const { attributes } = req.body;
    if (!Array.isArray(attributes)) return res.status(400).json({ success: false, message: 'Attributes must be an array' });

    const category = await SubCategory.update(req.params.id, { attributes });
    await deleteCache(`categories:detail:${req.params.id}`);
    res.status(200).json({ success: true, message: 'Attributes updated', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
