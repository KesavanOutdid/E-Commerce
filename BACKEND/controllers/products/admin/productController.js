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
    // Get all productIds that the admin has listed in SellerProduct
    const adminListings = await SellerProduct.collection().find({ 
      sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId 
    }).project({ productId: 1 }).toArray();
    
    const adminListedProductIds = adminListings.map(l => l.productId);

    // Query products that were either created by admin OR listed by admin
    let query = { 
      $or: [
        { roleId: 1 },
        { productId: { $in: adminListedProductIds } }
      ]
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query, { skip, limit }),
      Product.count(query)
    ]);

    // Map category names and listing data
    const productsWithCategoryNames = await Promise.all(products.map(async (product) => {
      const [mainCategory, subCategory, listing] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
        SellerProduct.collection().findOne({ 
          productId: product.productId, 
          sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId 
        })
      ]);

      return {
        ...product,
        // Override master price/stock with the admin's listing data
        price: listing ? listing.price : product.price,
        salePrice: listing ? listing.salePrice : product.salePrice,
        stock: listing ? listing.stock : product.stock,
        deliveryDays: listing ? listing.deliveryDays : null,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        marketplaceListings: [] 
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const nonAdminUsers = await User.collection().find({
      roleId: 2 // Assuming roleId 2 is Seller
    }).project({ userId: 1 }).toArray();
    
    const sellerIds = nonAdminUsers.map(u => u.userId);

    const query = { sellerId: { $in: sellerIds } };

    const [listings, total] = await Promise.all([
      SellerProduct.collection().find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      SellerProduct.collection().countDocuments(query)
    ]);

    const productIds = [...new Set(listings.map(l => l.productId))];
    
    const [products, users, sellers] = await Promise.all([
      Product.collection().find({ productId: { $in: productIds } }).toArray(),
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

    const productMap = new Map();
    products.forEach(p => productMap.set(p.productId, p));

    const userMap = new Map();
    users.forEach(u => {
      const id = u.userId || u._id.toString();
      userMap.set(id.toString(), u);
    });

    const shopMap = new Map();
    sellers.forEach(s => {
      if (s.userId) shopMap.set(s.userId.toString(), s.shopName);
    });

    // Map everything together
    const productsWithDetails = await Promise.all(listings.map(async (listing) => {
      const product = productMap.get(listing.productId);
      if (!product) return null;

      const [mainCategory, subCategory] = await Promise.all([
        product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
        product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null
      ]);

      const user = listing.sellerId ? userMap.get(listing.sellerId.toString()) : null;
      const sellerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';
      const shopName = listing.sellerId ? shopMap.get(listing.sellerId.toString()) : null;

      return {
        ...product,
        // Override master price/stock with listing data
        price: listing.price,
        salePrice: listing.salePrice,
        stock: listing.stock,
        deliveryDays: listing.deliveryDays,
        approvalStatus: listing.approvalStatus, // Seller's listing approval status
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
        products: productsWithDetails.filter(p => p !== null),
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

    const allOffers = marketplaceListings
      .filter(m => m.currentPrice > 0 && parseInt(m.stock) > 0)
      .map(m => ({
        price: m.currentPrice,
        sellerId: m.sellerId,
        sellerProductId: m.sellerProductId,
        productId: m.productId,
        sellerName: m.sellerName || "Seller",
        shopName: m.shopName || "Marketplace",
        stock: parseInt(m.stock),
        deliveryDays: m.deliveryDays,
        isSeller: true 
      }));

    const minPrice = allOffers.length > 0 ? Math.min(...allOffers.map(o => o.price)) : 0;
    const sellerCount = allOffers.length;
    const minPriceDetails = allOffers.find(o => o.price === minPrice) || null;

    // Find if the current requesting admin has a listing for this product
    const adminListing = rawMarketplaceListings.find(l => 
      l.sellerId && req.userId && l.sellerId.toString() === req.userId.toString()
    );

    const productWithCategoryNames = {
      ...product.toObject ? product.toObject() : product,
      masterPrice: product.price,
      masterSalePrice: product.salePrice,
      // Priority: 1. Admin's own listing, 2. Cheapest marketplace offer, 3. Master product price
      price: adminListing ? adminListing.price : (minPriceDetails ? minPriceDetails.price : product.price),
      salePrice: adminListing ? adminListing.salePrice : (minPriceDetails ? minPriceDetails.price : product.salePrice),
      stock: adminListing ? adminListing.stock : (minPriceDetails ? minPriceDetails.stock : product.stock),
      deliveryDays: adminListing ? adminListing.deliveryDays : (minPriceDetails ? minPriceDetails.deliveryDays : null),
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

    // Separate master product data from listing data
    const { price, salePrice, stock, deliveryDays, ...masterData } = req.body;

    const updateData = { 
      ...masterData, 
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
