const Product = require('../../../models/Product');
const ProductVariant = require('../../../models/ProductVariant');
const User = require('../../../models/User');
const Seller = require('../../../models/Seller');
const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');
const { slugify } = require('../../../utils/help');
const { ObjectId } = require('mongodb');

exports.createProduct = async (req, res) => {
  try {
    if (req.roleId !== 1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can create products' 
      });
    }

    const { productName, mainCategoryId, subCategoryId, description, shortDescription, createdBy, brand, highlights, specifications, warranty } = req.body;
    let { variants, attributes } = req.body;

    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        attributes = [];
      }
    }

    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        variants = [];
      }
    }

    let parsedHighlights = highlights;
    if (typeof highlights === 'string') {
      try {
        parsedHighlights = JSON.parse(highlights);
      } catch (e) {
        parsedHighlights = [highlights];
      }
    }

    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = [];
      }
    }

    if (!productName || !mainCategoryId || !subCategoryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'productName, mainCategoryId, and subCategoryId are required fields' 
      });
    }

    if (!variants || variants.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'At least one product variant is required'
        });
    }

    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'At least one product image is required' 
    //   });
    // }

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
    
    // Check if the product already exists for THIS user/admin
    const duplicateCheck = await Product.collection().findOne({ 
      slug: normalizedSlug,
      userId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
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

    const allImages = req.files.map(file => `/uploads/products/${file.filename}`);

    // 1. Create Master Product
    const masterProductData = {
      productName,
      slug: normalizedSlug,
      description,
      shortDescription,
      brand,
      highlights: parsedHighlights,
      specifications: parsedSpecifications,
      warranty,
      mainCategoryId,
      subCategoryId,
      userId: req.userId,
      roleId: 1,
      status: true,
      createdby: createdBy
    };

    const masterProduct = await Product.create(masterProductData);
    const variantsCreated = [];

    // 2. Create Variants
    for (let i = 0; i < variants.length; i++) {
        const variantData = variants[i];
        
        let variantImages = allImages;
        if (variantData.imageIndices && Array.isArray(variantData.imageIndices)) {
            variantImages = variantData.imageIndices.map(idx => allImages[idx]).filter(img => img !== undefined);
        } else if (variants.length > 1) {
            variantImages = allImages;
        }

        const variant = await ProductVariant.create({
            productId: masterProduct.productId,
            sellerId: req.userId,
            attributes: [...(attributes || []), ...(variantData.attributes || [])],
            price: parseFloat(variantData.price) || 0,
            salePrice: variantData.salePrice ? parseFloat(variantData.salePrice) : null,
            stock: parseInt(variantData.stock) || 0,
            images: variantImages,
            deliveryDays: variantData.deliveryDays || 3,
            pickupAddress: variantData.pickupAddress || null,
            approvalStatus: 'approved'
        });
        
        variantsCreated.push(variant.variantId);
    }

    await deleteCachePattern('products:list:*');

    res.status(201).json({ 
      success: true, 
      message: `Product Master and ${variants.length} Variants created successfully by admin`,
      data: {
        productId: masterProduct.productId,
        variantIds: variantsCreated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    let query = { roleId: 1 };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$and = [
        { roleId: 1 },
        {
          $or: [
            { productName: searchRegex },
            { slug: searchRegex },
            { description: searchRegex }
          ]
        }
      ];
      // Clean up the initial query property if using $and
      delete query.roleId;
    }
    
    const page = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.collection().find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
      Product.collection().countDocuments(query)
    ]);

    const productsWithCategoryNames = await Promise.all(products.map(async (product) => {
      const [mainCategory, subCategory, variants] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
        ProductVariant.collection().find({ productId: product.productId }).toArray()
      ]);

      return {
        ...product,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        variantsCount: variants.length,
        variants: variants
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: 'Admin product catalog fetched successfully',
      data: {
        products: productsWithCategoryNames,
        pagination: {
          total,
          page,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSellerProducts = async (req, res) => {
  try {
    let query = { roleId: 2 };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$and = [
        { roleId: 2 },
        {
          $or: [
            { productName: searchRegex },
            { slug: searchRegex },
            { description: searchRegex }
          ]
        }
      ];
      delete query.roleId;
    }

    const page = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.collection().find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
      Product.collection().countDocuments(query)
    ]);

    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const userQuery = {};
      if (ObjectId.isValid(product.userId)) {
        userQuery.$or = [
          { _id: new ObjectId(product.userId) },
          { userId: product.userId.toString() }
        ];
      } else {
        userQuery.userId = product.userId;
      }

      const [mainCategory, subCategory, variants, user] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
        ProductVariant.collection().find({ productId: product.productId }).toArray(),
        User.collection().findOne(userQuery)
      ]);

      let sellerName = 'Unknown';
      if (user) {
        sellerName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (!sellerName) sellerName = user.name || user.email || 'Unknown';
      }

      return {
        ...product,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        sellerName,
        variantsCount: variants.length,
        variants: variants
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: 'All seller products fetched successfully',
      data: {
        products: productsWithDetails,
        pagination: {
          total,
          page,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [mainCategory, subCategory, variants] = await Promise.all([
      product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
      product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
      ProductVariant.collection().find({ productId: product.productId }).toArray()
    ]);

    // Collect all unique seller IDs from variants
    const sellerIds = [...new Set(variants.map(v => v.sellerId))];
    if (product.userId) sellerIds.push(product.userId);

    const [users, sellers] = await Promise.all([
      User.collection().find({
        $or: [
          { userId: { $in: sellerIds } },
          { _id: { $in: sellerIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id)) } }
        ]
      }).toArray(),
      Seller.collection().find({
        userId: { $in: sellerIds }
      }).toArray()
    ]);

    const userMap = new Map();
    users.forEach(u => {
      if (u.userId) userMap.set(u.userId.toString(), u);
      if (u._id) userMap.set(u._id.toString(), u);
    });

    const shopMap = new Map();
    sellers.forEach(s => {
      if (s.userId) shopMap.set(s.userId.toString(), s.shopName);
    });

    const getSellerDetails = (userId) => {
      if (!userId) return { sellerName: null, shopName: null };
      const user = userMap.get(userId.toString());
      if (!user) return { sellerName: null, shopName: null };

      if (user.roleId === 1 || (user.roles && (user.roles === 1 || user.roles.includes?.(1)))) {
        return { sellerName: "Admin", shopName: "Outdid" };
      }

      let sellerName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (!sellerName) sellerName = user.name || user.email || 'Unknown';
      const shopName = shopMap.get(user.userId?.toString() || user._id?.toString()) || null;

      return { sellerName, shopName };
    };

    const variantsWithSellerDetails = variants.map(variant => {
      const sellerDetails = getSellerDetails(variant.sellerId);
      return {
        ...variant,
        ...sellerDetails,
        currentPrice: parseFloat(variant.salePrice) > 0 ? parseFloat(variant.salePrice) : parseFloat(variant.price)
      };
    });

    const masterSeller = getSellerDetails(product.userId);

    const minPriceVariant = variantsWithSellerDetails.length > 0 
      ? variantsWithSellerDetails.reduce((prev, curr) => (prev.currentPrice < curr.currentPrice ? prev : curr))
      : null;

    const productResponse = {
      ...product.toObject ? product.toObject() : product,
      mainCategoryName: mainCategory ? mainCategory.name : null,
      subCategoryName: subCategory ? subCategory.name : null,
      sellerName: masterSeller.sellerName,
      shopName: masterSeller.shopName,
      minPriceDetails: minPriceVariant ? {
        variantId: minPriceVariant.variantId,
        sellerName: minPriceVariant.sellerName,
        shopName: minPriceVariant.shopName,
        price: minPriceVariant.price,
        salePrice: minPriceVariant.salePrice,
        currentPrice: minPriceVariant.currentPrice,
        attributes: minPriceVariant.attributes
      } : null,
      variants: variantsWithSellerDetails
    };

    res.status(200).json({
      success: true,
      message: 'Product details fetched successfully',
      data: {
        product: productResponse,
        variantsCount: variants.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { productName, description, shortDescription, updatedby, attributes, price, salePrice, stock, deliveryDays, pickupAddress } = req.body;

    // 1. Check if it's a Master Product
    const existingProduct = await Product.findById(id);
    if (existingProduct) {
      if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch (e) { attributes = undefined; }
      }

      const updateData = { 
        productName, 
        description, 
        shortDescription, 
        updatedby,
        attributes: attributes !== undefined ? attributes : undefined
      };

      if (productName) updateData.slug = slugify(productName);
      
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
        updateData.images = [...(existingProduct.images || []), ...newImages];
      }

      // Remove undefined keys
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await Product.update(id, updateData);
      await deleteCachePattern('products:list:*');
      await deleteCache(`products:detail:${id}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Product Master updated successfully',
      });
    }

    // 2. Check if it's a Variant
    const variant = await ProductVariant.findById(id);
    if (variant) {
      if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch (e) { attributes = undefined; }
      }

      const variantUpdateData = {
        attributes: attributes !== undefined ? attributes : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        deliveryDays: deliveryDays !== undefined ? parseInt(deliveryDays) : undefined,
        pickupAddress: pickupAddress !== undefined ? pickupAddress : undefined
      };

      // Remove undefined keys
      Object.keys(variantUpdateData).forEach(key => variantUpdateData[key] === undefined && delete variantUpdateData[key]);

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
        variantUpdateData.images = [...(variant.images || []), ...newImages];
      }

      await ProductVariant.update(id, variantUpdateData);
      await deleteCachePattern('products:list:*');
      await deleteCache(`products:detail:${variant.productId}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Variant updated successfully',
      });
    }

    return res.status(404).json({ success: false, message: 'Product or Variant not found' });
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

exports.updateApprovalStatus = async (req, res) => {
  try {
    if (req.roleId !== 1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can perform this action' 
      });
    }

    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

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

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (existingProduct.roleId !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only seller products require approval' 
      });
    }

    const updateData = { 
      approvalStatus, 
      rejectionReason: approvalStatus === 'rejected' ? rejectionReason : null 
    };
    
    const product = await Product.update(id, updateData);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Also update all product variants for this master product
    await ProductVariant.collection().updateMany(
      { productId: product.productId },
      { 
        $set: { 
          approvalStatus: updateData.approvalStatus,
          updatedAt: new Date()
        } 
      }
    );

    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);

    const { _id, ...responseData } = product;

    res.status(200).json({ 
      success: true, 
      message: `Product ${approvalStatus} successfully`    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addVariant = async (req, res) => {
  try {
    if (req.roleId !== 1) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can perform this action' 
      });
    }

    const { masterProductId } = req.params;
    const { price, salePrice, stock, attributes, deliveryDays, pickupAddress } = req.body;

    const masterProduct = await Product.findById(masterProductId);

    if (!masterProduct) {
      return res.status(404).json({ success: false, message: 'Master product not found' });
    }

    let parsedAttributes = attributes;
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (e) {
        parsedAttributes = [];
      }
    }

    const images = req.files && req.files.length > 0 
      ? req.files.map(file => `/uploads/products/${file.filename}`)
      : [];

    const variant = await ProductVariant.create({
      productId: masterProduct.productId,
      sellerId: req.userId,
      attributes: parsedAttributes || [],
      price: parseFloat(price) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock) || 0,
      images: images,
      deliveryDays: deliveryDays || 3,
      pickupAddress: pickupAddress || null,
      approvalStatus: 'approved'
    });

    await deleteCachePattern('products:list:*');

    res.status(201).json({
      success: true,
      message: 'Variant added successfully by admin',
      data: { variantId: variant.variantId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
