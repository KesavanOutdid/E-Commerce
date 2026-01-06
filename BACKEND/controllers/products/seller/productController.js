const Product = require('../../../models/Product');
const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');
const { slugify } = require('../../../utils/help');
const { ObjectId } = require('mongodb');

exports.createProduct = async (req, res) => {
  try {
    if (req.roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only sellers can create products' 
      });
    }

    const { productName, mainCategoryId, subCategoryId, price, stock, description, shortDescription, userId,createdby } = req.body;
    let { attributes } = req.body;

    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        attributes = [];
      }
    }

    if (!productName || !mainCategoryId || !subCategoryId || price === undefined || stock === undefined || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'productName, mainCategoryId, subCategoryId, price, stock, and userId are required fields' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one product image is required' 
      });
    }

    const category = await SubCategory.findById(subCategoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'SubCategory not found' 
      });
    }

    // Verify mainCategoryId matches subcategory's parentId
    if (category.parentId !== mainCategoryId) {
       return res.status(400).json({
         success: false,
         message: 'The provided mainCategoryId does not match the subcategory\'s parent'
       });
    }

    const categoryAttributes = category.attributes || [];
    if (categoryAttributes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot create product. Selected category has no attributes. Add attributes to the category first.' 
      });
    }

    const normalizedSlug = slugify(productName);

    // Check if the product already exists for THIS seller
    const duplicateCheck = await Product.collection().findOne({ 
      slug: normalizedSlug,
      userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
    });

    if (duplicateCheck) {
      return res.status(409).json({
        success: false,
        message: 'You have already created a product with this name'
      });
    }

    const existingMaster = await Product.collection().findOne({ 
      slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') } 
    });
    const masterProductId = existingMaster ? (existingMaster.masterProductId || existingMaster.productId) : null;

    const images = req.files.map(file => `/uploads/products/${file.filename}`);

    const productData = {
      ...req.body,
      productName,
      slug: normalizedSlug,
      description,
      shortDescription,
      mainCategoryId,
      subCategoryId,
      masterProductId: masterProductId,
      userId,
      images: images,
      attributes: attributes || [],
      roleId: 2,
      approvalStatus: 'pending',
      status: true,createdby
    };
    
    const product = await Product.create(productData);

    await deleteCachePattern('products:list:*');

    // Return only necessary fields
    const { _id, ...responseData } = product;

    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully, awaiting approval',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const filterUserId = req.query.userId || req.userId;

    // Seller sees their own products (or specified userId) OR Admin products
    let query = {
      $or: [
        { userId: filterUserId },
        { roleId: 1 }
      ]
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query, { skip, limit }),
      Product.count(query)
    ]);

    // Map category names
    const productsWithCategoryNames = await Promise.all(products.map(async (product) => {
      const [mainCategory, subCategory] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null
      ]);

      return {
        ...product,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: 'Seller products fetched successfully',
      data: {
        products: productsWithCategoryNames,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let { productName, price, stock, description, shortDescription,updatedby, attributes } = req.body;

    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        attributes = [];
      }
    }

    if (Object.keys(req.body).length === 0 && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Seller ownership check
    if (existingProduct.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own products' 
      });
    }

    const updateData = { ...req.body, updatedby };
    if (attributes !== undefined) {
      updateData.attributes = attributes;
    }
    if (productName) {
      updateData.slug = slugify(productName);
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      updateData.images = [...(existingProduct.images || []), ...newImages];
    }

    const product = await Product.update(req.params.id, updateData);
    
    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);

    const { _id, ...responseData } = product;

    res.status(200).json({ 
      success: true, 
      message: 'Product updated successfully'    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own products' 
      });
    }

    await Product.delete(req.params.id);
    
    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
