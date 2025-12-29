const Product = require('../../../models/Product');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');

exports.createProduct = async (req, res) => {
  try {
    // Only Sellers (role 2) and Admins (role 1) can create products
    if (req.roleId !== 1 && req.roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only sellers and admins can create products' 
      });
    }

    const { productName, slug, categoryId, price, stock, subCategoryId, userId, roleId } = req.body;

    // Validation
    if (!productName || !slug || !categoryId || price === undefined || stock === undefined || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'productName, slug, categoryId, price, stock, and userId are required fields' 
      });
    }

    // MULTI-SELLER LOGIC: Check if product with same slug already exists to get its masterProductId
    const existingMaster = await Product.collection().findOne({ slug: slug });
    const masterProductId = existingMaster ? (existingMaster.masterProductId || existingMaster.productId) : null;

    const productData = {
      ...req.body,
      productName,
      categoryId,
      subCategoryId,
      masterProductId: masterProductId, // Link to the same "Master" product
      // If Admin (role 1) use userId from body, if Seller (role 2) ALWAYS use their own req.userId
      userId: req.roleId === 1 ? userId : req.userId,
      // Store roleId from body in DB
      roleId: roleId,
      approvalStatus: req.roleId === 1 ? 'approved' : 'pending',
      status: true
    };
    const product = await Product.create(productData);

    // Invalidate product listing cache
    await deleteCachePattern('products:list:*');

    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    let query = {};
    
    // If not Admin (role 1), see own products OR Admin-added products
    if (req.roleId !== 1) {
      query = {
        $or: [
          { userId: req.userId },
          { roleId: 1 }
        ]
      };
    }
    
    if (req.query.approvalStatus) {
      // If we already have an $or query, we need to ensure the status applies to the results
      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            { approvalStatus: req.query.approvalStatus }
          ]
        };
      } else {
        query.approvalStatus = req.query.approvalStatus;
      }
    }

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query, { skip, limit }),
      Product.count(query)
    ]);

    res.status(200).json({ 
      success: true, 
      message: 'Products fetched successfully',
      data: {
        products,
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
    const { productName, slug, price, stock } = req.body;

    // Check if body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    // Ownership check: Sellers can only update their own products
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.roleId !== 1 && existingProduct.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own products' 
      });
    }

    // Optional validations for specific fields if they are provided
    if (productName !== undefined && !productName) return res.status(400).json({ success: false, message: 'ProductName cannot be empty' });
    if (slug !== undefined && !slug) return res.status(400).json({ success: false, message: 'Slug cannot be empty' });
    if (price !== undefined && price < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative' });

    const product = await Product.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate caches
    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);
    if (product?.productId) await deleteCache(`products:detail:${product.productId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Product updated successfully',
      data: product 
    });
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

    // Ownership check: Sellers can only delete their own products
    if (req.roleId !== 1 && product.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own products' 
      });
    }

    await Product.delete(req.params.id);
    
    // Invalidate caches
    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);
    if (product?.productId) await deleteCache(`products:detail:${product.productId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApprovalStatus = async (req, res) => {
  try {
    // Check if user is admin (role 1)
    if (req.roleId !== 1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can perform this action' 
      });
    }

    const { approvalStatus, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "approved" or "rejected"' 
      });
    }

    if (approvalStatus === 'rejected' && !rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required when status is "rejected"' 
      });
    }

    const updateData = { 
      approvalStatus, 
      rejectionReason: approvalStatus === 'rejected' ? rejectionReason : null 
    };
    
    const product = await Product.update(req.params.id, updateData);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate caches
    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);
    if (product?.productId) await deleteCache(`products:detail:${product.productId}`);

    res.status(200).json({ 
      success: true, 
      message: `Product ${approvalStatus} successfully`,
      data: product 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
