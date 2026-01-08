const Product = require('../../../models/Product');
const SellerProduct = require('../../../models/SellerProduct');
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

    const { productName, mainCategoryId, subCategoryId, price, salePrice, stock, description, shortDescription,createdBy } = req.body;
    let { attributes } = req.body;

    if (typeof attributes === 'string') {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        attributes = [];
      }
    }

    if (!productName || !mainCategoryId || !subCategoryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'productName, mainCategoryId, and subCategoryId are required fields' 
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
      userId: req.userId,
      images: images,
      attributes: attributes || [],
      roleId: 1,
      status: true,
      createdby: createdBy
    };
    
    const product = await Product.create(productData);

    // Automatically create a listing for the admin who created the product
    await SellerProduct.create({
      productId: product.productId,
      sellerId: req.userId,
      price: price ? parseFloat(price) : 0,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: stock ? parseInt(stock) : 0,
      deliveryDays: req.body.deliveryDays || 3,
      approvalStatus: 'approved'
    });

    await deleteCachePattern('products:list:*');

    // Return only necessary fields
    const { _id, ...responseData } = product;

    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully by admin',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    let query = { roleId: 1 };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query, { skip, limit }),
      Product.count(query)
    ]);

    // Map category names
    const productsWithCategoryNames = await Promise.all(products.map(async (product) => {
      const [mainCategory, subCategory, listing] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
        SellerProduct.collection().findOne({ 
          productId: product.productId, 
          sellerId: ObjectId.isValid(product.userId) ? new ObjectId(product.userId) : product.userId 
        })
      ]);

      return {
        ...product,
        // Override master price/stock with listing data
        price: listing ? listing.price : product.price,
        salePrice: listing ? listing.salePrice : product.salePrice,
        stock: listing ? listing.stock : product.stock,
        deliveryDays: listing ? listing.deliveryDays : null,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        marketplaceListings: [] // Admin view for own products doesn't strictly need marketplace list here
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: 'Admin products fetched successfully',
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

exports.getAllSellerProducts = async (req, res) => {
  try {
    let query = { roleId: 2 };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query, { skip, limit }),
      Product.count(query)
    ]);

    // Fetch seller names and shop names
    const sellerIds = [...new Set(products.map(p => p.userId).filter(Boolean))];
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
      const id = u.userId || u._id.toString();
      userMap.set(id.toString(), u);
    });

    const shopMap = new Map();
    sellers.forEach(s => {
      if (s.userId) shopMap.set(s.userId.toString(), s.shopName);
    });

    // Map category names and seller details
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      const [mainCategory, subCategory, listing] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
        SellerProduct.collection().findOne({ 
          productId: product.productId, 
          sellerId: ObjectId.isValid(product.userId) ? new ObjectId(product.userId) : product.userId 
        })
      ]);

      const user = product.userId ? userMap.get(product.userId.toString()) : null;
      const sellerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';
      const shopName = product.userId ? shopMap.get(product.userId.toString()) : null;

      return {
        ...product,
        // Override master price/stock with listing data
        price: listing ? listing.price : product.price,
        salePrice: listing ? listing.salePrice : product.salePrice,
        stock: listing ? listing.stock : product.stock,
        deliveryDays: listing ? listing.deliveryDays : null,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        sellerName,
        shopName
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
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listProduct = async (req, res) => {
    try {
        if (req.roleId !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can list products via this endpoint'
            });
        }

        const { productId, price, salePrice, stock, deliveryDays } = req.body;

        if (!productId || price === undefined || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'productId, price, and stock are required'
            });
        }

        // Check if product exists in catalog
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in catalog'
            });
        }

        // Check if this admin already listed this product
        const existingListing = await SellerProduct.collection().findOne({
            productId,
            sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
        });

        if (existingListing) {
            return res.status(409).json({
                success: false,
                message: 'You have already listed this product. Update the existing listing instead.'
            });
        }

        const sellerProductData = {
            productId,
            sellerId: req.userId,
            price,
            salePrice,
            stock,
            deliveryDays,
            approvalStatus: 'approved'
        };

        const sellerProduct = await SellerProduct.create(sellerProductData);

        await deleteCachePattern('products:list:*');

        res.status(201).json({
            success: true,
            message: 'Product listed successfully by admin',
            data: sellerProduct
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

    const [mainCategory, subCategory, rawMarketplaceListings] = await Promise.all([
      product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
      product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
      SellerProduct.collection().find({ productId: product.productId }).toArray()
    ]);

    // Collect all seller IDs to fetch their details in bulk
    const sellerIds = [...new Set([
      ...(product.userId ? [product.userId] : []),
      ...rawMarketplaceListings.map(listing => listing.sellerId)
    ])];

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

      // If the user is an admin, return Admin branding
      if (user.roleId === 1 || (user.roles && (user.roles === 1 || user.roles.includes?.(1)))) {
        return { sellerName: "Admin", shopName: "Outdid" };
      }

      let sellerName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (!sellerName) sellerName = user.name || user.email || 'Unknown';
      const shopName = shopMap.get(user.userId?.toString() || user._id?.toString()) || null;

      return { sellerName, shopName };
    };

    const mainSeller = getSellerDetails(product.userId);
    
    const marketplaceListings = rawMarketplaceListings.map(listing => {
      const details = getSellerDetails(listing.sellerId);
      return {
        ...listing,
        ...details,
        currentPrice: parseFloat(listing.salePrice) > 0 ? parseFloat(listing.salePrice) : parseFloat(listing.price)
      };
    });

    const mainPrice = parseFloat(product.salePrice) > 0 ? parseFloat(product.salePrice) : parseFloat(product.price);
    const allOffers = [];

    // Add main product as an offer (Creator's offer)
    if (mainPrice > 0 && parseInt(product.stock) > 0) {
      allOffers.push({
        price: mainPrice,
        sellerId: product.userId, 
        sellerProductId: null,
        productId: product.productId,
        sellerName: product.roleId === 1 ? "Admin" : (mainSeller.sellerName || "Seller"),
        shopName: product.roleId === 1 ? "Outdid" : (mainSeller.shopName || "Marketplace"),
        stock: parseInt(product.stock),
        isSeller: product.roleId === 2
      });
    }

    // Add marketplace listings, also filtering for valid price/stock
    marketplaceListings.forEach(m => {
      // Prevent showing the same seller twice if they are already the creator
      const isDuplicate = allOffers.some(o => o.sellerId.toString() === m.sellerId.toString());
      
      if (!isDuplicate && m.currentPrice > 0 && parseInt(m.stock) > 0) {
        allOffers.push({
          price: m.currentPrice,
          sellerId: m.sellerId,
          sellerProductId: m.sellerProductId,
          productId: m.productId,
          sellerName: m.sellerName || "Seller",
          shopName: m.shopName || "Marketplace",
          stock: parseInt(m.stock),
          deliveryDays: m.deliveryDays,
          isSeller: true
        });
      }
    });

    const minPrice = allOffers.length > 0 ? Math.min(...allOffers.map(o => o.price)) : 0;
    const sellerCount = allOffers.filter(o => o.isSeller).length;
    const minPriceDetails = allOffers.find(o => o.price === minPrice) || null;

    const productWithCategoryNames = {
      ...product,
      mainCategoryName: mainCategory ? mainCategory.name : null,
      subCategoryName: subCategory ? subCategory.name : null,
      marketplaceListings: marketplaceListings,
      allOffers: allOffers,
      minPrice: minPrice,
      sellerCount: sellerCount,
      minPriceDetails: minPriceDetails,
      ...(mainSeller.sellerName && { sellerName: mainSeller.sellerName }),
      ...(mainSeller.shopName && { shopName: mainSeller.shopName })
    };

    res.status(200).json({
      success: true,
      message: 'Product details fetched successfully',
      data: {
        product: productWithCategoryNames,
        sellerCount: sellerCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let { productName, description, shortDescription, updatedby, attributes } = req.body;

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

    const updateData = { 
      ...req.body, 
      updatedby
    };

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
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // UPDATE LISTING DATA (Price, Stock, DeliveryDays) in SellerProduct table
    const { price, salePrice, stock, deliveryDays } = req.body;
    if (price !== undefined || salePrice !== undefined || stock !== undefined || deliveryDays !== undefined) {
      await SellerProduct.collection().findOneAndUpdate(
        { 
          productId: product.productId, 
          sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId 
        },
        { 
          $set: { 
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(salePrice !== undefined && { salePrice: parseFloat(salePrice) }),
            ...(stock !== undefined && { stock: parseInt(stock) }),
            ...(deliveryDays !== undefined && { deliveryDays: parseInt(deliveryDays) }),
            updatedAt: new Date()
          }
        }
      );
    }

    await deleteCachePattern('products:list:*');
    await deleteCache(`products:detail:${req.params.id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Product updated successfully',
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
