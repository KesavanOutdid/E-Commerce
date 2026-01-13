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

    for (let i = 0; i < variants.length; i++) {
      const variantData = variants[i];
      const hasImageIndices = variantData.imageIndices && Array.isArray(variantData.imageIndices) && variantData.imageIndices.length > 0;
      const hasVariantFiles = req.files && req.files.some(f => f.fieldname === `variantImages_${i}`);
      
      if (!hasImageIndices && !hasVariantFiles) {
        return res.status(400).json({
          success: false,
          message: `Variant ${i + 1}: At least one image must be uploaded or selected`
        });
      }
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

    const allImages = req.files ? req.files.filter(f => f.fieldname === 'images').map(file => `/uploads/products/${file.filename}`) : [];

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
      images: allImages, // Master product gets the main images
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
        
        // Get images specifically for this variant
        const variantSpecificImages = req.files 
            ? req.files.filter(f => f.fieldname === `variantImages_${i}`).map(file => `/uploads/products/${file.filename}`)
            : [];
        
        // If no variant-specific images, maybe fallback to master images or keep empty
        const variantImages = variantSpecificImages.length > 0 ? variantSpecificImages : allImages;

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
    const adminId = ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId;
    const variantProductIds = await ProductVariant.collection().distinct('productId', { sellerId: adminId });

    let query = {
      $or: [
        { roleId: 1 },
        { productId: { $in: variantProductIds } }
      ]
    };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchCondition = {
        $or: [
          { productName: searchRegex },
          { slug: searchRegex },
          { description: searchRegex }
        ]
      };
      query = { $and: [query, searchCondition] };
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
    const sellers = await User.collection().find({ roles: 2 }).toArray();
    const sellerIdsSearch = [];
    sellers.forEach(u => {
      const id = u.userId || u._id.toString();
      sellerIdsSearch.push(id);
      if (ObjectId.isValid(id)) {
        sellerIdsSearch.push(new ObjectId(id));
      }
    });

    let baseQuery = {
      $or: [
        { roleId: 2 }
      ]
    };

    let variantSellerFilter = { sellerId: { $in: sellerIdsSearch } };

    // If specific seller filtering is requested
    if (req.query.sellerId) {
      const selectedSellerId = req.query.sellerId;
      const selectedSellerIdVariants = [selectedSellerId];
      if (ObjectId.isValid(selectedSellerId)) {
        selectedSellerIdVariants.push(new ObjectId(selectedSellerId));
      }
      const selectedSellerIdQuery = { $in: selectedSellerIdVariants };
      
      variantSellerFilter = { sellerId: selectedSellerIdQuery };

      const variantProductIdsForSeller = await ProductVariant.collection().distinct('productId', variantSellerFilter);
      
      baseQuery = {
        $or: [
          { userId: selectedSellerIdQuery },
          { productId: { $in: variantProductIdsForSeller } }
        ]
      };
    } else {
      // Include any product that has at least one seller variant
      const variantProductIdsWithSellers = await ProductVariant.collection().distinct('productId', variantSellerFilter);
      baseQuery.$or.push({ productId: { $in: variantProductIdsWithSellers } });
    }

    let query = baseQuery;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchCondition = {
        $or: [
          { productName: searchRegex },
          { slug: searchRegex },
          { description: searchRegex }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    if (req.query.approvalStatus) {
      // Find productIds that have at least one variant with this approvalStatus
      const variantFilterWithStatus = { ...variantSellerFilter, approvalStatus: req.query.approvalStatus };
      const productIdsWithStatus = await ProductVariant.collection().distinct('productId', variantFilterWithStatus);
      
      const statusCondition = { productId: { $in: productIdsWithStatus } };
      if (query.$and) {
        query.$and.push(statusCondition);
      } else {
        query = { $and: [query, statusCondition] };
      }
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
        ProductVariant.collection().find({ 
          productId: product.productId,
          ...variantSellerFilter
        }).toArray(),
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

    // 1. Extract unique attribute options across all variants (Only required ones)
    const attributeOptions = {};
    variants.forEach(v => {
      if (v.attributes && Array.isArray(v.attributes)) {
        v.attributes.forEach(attr => {
          if (attr.required === true) {
            if (!attributeOptions[attr.name]) {
              attributeOptions[attr.name] = new Set();
            }
            attributeOptions[attr.name].add(attr.value);
          }
        });
      }
    });

    // Convert Sets to Arrays for the response
    Object.keys(attributeOptions).forEach(key => {
      attributeOptions[key] = Array.from(attributeOptions[key]);
    });

    const minPriceVariant = variantsWithSellerDetails.length > 0 
      ? variantsWithSellerDetails.reduce((prev, curr) => (prev.currentPrice < curr.currentPrice ? prev : curr))
      : null;

    const productResponse = {
      ...product.toObject ? product.toObject() : product,
      mainCategoryName: mainCategory ? mainCategory.name : null,
      subCategoryName: subCategory ? subCategory.name : null,
      sellerName: masterSeller.sellerName,
      shopName: masterSeller.shopName,
      attributeOptions, // Only shows required options (e.g. RAM, Storage)
      minPriceDetails: minPriceVariant ? {
        variantId: minPriceVariant.variantId,
        sellerName: minPriceVariant.sellerName,
        shopName: minPriceVariant.shopName,
        price: minPriceVariant.price,
        salePrice: minPriceVariant.salePrice,
        currentPrice: minPriceVariant.currentPrice,
        // Create a summary of the REQUIRED attributes only
        attributeSummary: minPriceVariant.attributes
          .filter(a => a.required === true)
          .map(a => `${a.value}${a.name === 'RAM' || a.name === 'Storage' ? 'GB' : ''} ${a.name}`)
          .join(", "),
        attributes: minPriceVariant.attributes,
        images: minPriceVariant.images
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
    let { 
      productName, 
      description, 
      shortDescription, 
      updatedby, 
      attributes, 
      price, 
      salePrice, 
      stock, 
      deliveryDays, 
      pickupAddress,
      mainCategoryId,
      subCategoryId,
      status,
      brand,
      highlights,
      specifications,
      warranty
    } = req.body;

    // 1. Check if it's a Master Product
    const existingProduct = await Product.findById(id);
    if (existingProduct) {
      if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch (e) { attributes = undefined; }
      }

      let parsedHighlights = highlights;
      if (typeof highlights === 'string') {
        try { parsedHighlights = JSON.parse(highlights); } catch (e) { parsedHighlights = undefined; }
      }

      let parsedSpecifications = specifications;
      if (typeof specifications === 'string') {
        try { parsedSpecifications = JSON.parse(specifications); } catch (e) { parsedSpecifications = undefined; }
      }

      let parsedVariants = req.body.variants;
      if (typeof parsedVariants === 'string') {
        try { parsedVariants = JSON.parse(parsedVariants); } catch (e) { parsedVariants = undefined; }
      }

      const updateData = { 
        productName, 
        description, 
        shortDescription, 
        updatedby,
        mainCategoryId,
        subCategoryId,
        brand,
        highlights: parsedHighlights,
        specifications: parsedSpecifications,
        warranty,
        status: status !== undefined ? (status === 'true' || status === true) : undefined,
        attributes: attributes !== undefined ? attributes : undefined
      };

      if (productName) updateData.slug = slugify(productName);
      
      if (req.files && req.files.length > 0) {
        const masterImages = req.files.filter(f => f.fieldname === 'images').map(file => `/uploads/products/${file.filename}`);
        if (masterImages.length > 0) {
          updateData.images = [...(existingProduct.images || []), ...masterImages];
        }
      }

      // Remove undefined keys
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await Product.update(id, updateData);

      // 1.1 Update Variants if provided
      if (parsedVariants && Array.isArray(parsedVariants)) {
        for (let i = 0; i < parsedVariants.length; i++) {
          const vData = parsedVariants[i];
          if (vData.variantId) {
            const variantUpdateData = {
              price: vData.price !== undefined ? parseFloat(vData.price) : undefined,
              salePrice: vData.salePrice !== undefined ? parseFloat(vData.salePrice) : undefined,
              stock: vData.stock !== undefined ? parseInt(vData.stock) : undefined,
              deliveryDays: vData.deliveryDays !== undefined ? parseInt(vData.deliveryDays) : undefined,
              pickupAddress: vData.pickupAddress !== undefined ? vData.pickupAddress : undefined,
              attributes: vData.attributes !== undefined ? vData.attributes : undefined,
              images: vData.existingImages // Use the existingImages list from frontend
            };

            // Add new variant-specific images if uploaded
            if (req.files) {
              const newVariantImages = req.files
                .filter(f => f.fieldname === `variantImages_${i}`)
                .map(file => `/uploads/products/${file.filename}`);
              
              if (newVariantImages.length > 0) {
                variantUpdateData.images = [...(variantUpdateData.images || []), ...newVariantImages];
              }
            }

            Object.keys(variantUpdateData).forEach(key => variantUpdateData[key] === undefined && delete variantUpdateData[key]);
            await ProductVariant.update(vData.variantId, variantUpdateData);
          } else {
            // Create new variant if variantId is missing
            let variantImages = req.files
              ? req.files.filter(f => f.fieldname === `variantImages_${i}`).map(file => `/uploads/products/${file.filename}`)
              : [];
            
            // If no new images uploaded for this variant, check for imageIndices from master product images
            if (variantImages.length === 0 && vData.imageIndices && Array.isArray(vData.imageIndices)) {
              const allMasterImages = updateData.images || existingProduct.images || [];
              variantImages = vData.imageIndices
                .map(idx => allMasterImages[idx])
                .filter(img => img !== undefined);
            }
            
            await ProductVariant.create({
              productId: existingProduct.productId,
              sellerId: existingProduct.userId,
              attributes: vData.attributes || [],
              price: parseFloat(vData.price) || 0,
              salePrice: vData.salePrice ? parseFloat(vData.salePrice) : null,
              stock: parseInt(vData.stock) || 0,
              images: variantImages,
              deliveryDays: vData.deliveryDays || 3,
              pickupAddress: vData.pickupAddress || null,
              approvalStatus: 'approved'
            });
          }
        }
      }

      await deleteCachePattern('products:list:*');
      await deleteCache(`products:detail:${id}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Product Master and Variants updated successfully',
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
    const { id } = req.params;

    // 1. Try to find and delete as a Product Master
    const product = await Product.findById(id);
    if (product) {
      await Product.delete(id);
      
      // Also delete all associated variants
      await ProductVariant.collection().deleteMany({ productId: product.productId });
      
      await deleteCachePattern('products:list:*');
      await deleteCache(`products:detail:${id}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Product and all its variants deleted successfully' 
      });
    }

    // 2. Try to find and delete as a Variant
    const variant = await ProductVariant.findById(id);
    if (variant) {
      await ProductVariant.delete(id);
      
      await deleteCachePattern('products:list:*');
      await deleteCache(`products:detail:${variant.productId}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Variant deleted successfully' 
      });
    }

    return res.status(404).json({ success: false, message: 'Product or Variant not found' });
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

exports.getSellersList = async (req, res) => {
  try {
    const users = await User.collection().find({ roles: 2 }).toArray();
    const userIds = users.map(u => u.userId || u._id.toString());
    
    const sellers = await Seller.collection().find({
      userId: { $in: userIds }
    }).toArray();

    const sellerMap = new Map();
    sellers.forEach(s => {
      if (s.userId) sellerMap.set(s.userId.toString(), s);
    });

    const sellersList = users.map(u => {
      const seller = sellerMap.get(u.userId?.toString() || u._id.toString());
      return {
        userId: u.userId || u._id.toString(),
        shopName: seller ? seller.shopName : null,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email || 'Unknown'
      };
    });

    res.status(200).json({
      success: true,
      data: sellersList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
