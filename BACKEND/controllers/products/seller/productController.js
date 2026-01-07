const Product = require('../../../models/Product');
const SellerProduct = require('../../../models/SellerProduct');
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
    const categoryParentId = category.parentId?.toString().trim();
    const providedMainCategoryId = mainCategoryId?.toString().trim();
    
    if (categoryParentId !== providedMainCategoryId) {
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
      price: 0,
      salePrice: 0,
      stock: 0,
      roleId: 2,
      approvalStatus: 'pending',
      status: true,createdby
    };
    
    const product = await Product.create(productData);

    // Automatically create a listing for the seller who created the product
    await SellerProduct.create({
      productId: product.productId,
      sellerId: req.userId || userId,
      price: price,
      salePrice: req.body.salePrice || null,
      stock: stock,
      deliveryDays: req.body.deliveryDays || 3,
      approvalStatus: 'approved'
    });

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
    const page = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limitNum;

    // Show ALL products in the system to prevent duplication
    let matchQuery = {}; 

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      matchQuery.$or = [
        { productName: searchRegex },
        { productId: req.query.search }
      ];
    }

    // Aggregate to group by slug to prevent duplication in the catalog view
    const pipeline = [
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$slug",
          product: { $first: "$$ROOT" },
          isMyProduct: { 
            $max: { 
              $cond: [
                { $eq: ["$userId", ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId] }, 
                true, 
                false 
              ] 
            } 
          }
        }
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const result = await Product.collection().aggregate(pipeline).toArray();
    
    const products = result[0].data.map(item => ({
      ...item.product,
      isMyProduct: item.isMyProduct
    }));

    const total = result[0].totalCount[0]?.count || 0;

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
      message: 'Unique product catalog fetched successfully',
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

    const updateData = { 
      ...req.body, 
      updatedby,
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) })
    };
    if (req.body.salePrice !== undefined) {
      updateData.salePrice = parseFloat(req.body.salePrice);
    }
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

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.collection().findOne({ productId: id });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const sellerListing = await SellerProduct.collection().findOne({
            productId: product.productId,
            sellerId: req.userId
        });

        const [mainCategory, subCategory] = await Promise.all([
            product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
            product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null
        ]);

        const responseData = {
            ...product,
            mainCategoryName: mainCategory ? mainCategory.name : null,
            subCategoryName: subCategory ? subCategory.name : null,
            sellerListing: sellerListing || null
        };

        res.status(200).json({
            success: true,
            message: 'Product details fetched successfully',
            data: responseData
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

exports.checkProductBySlug = async (req, res) => {
  try {
    const { productName } = req.body;

    if (!productName || !productName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const normalizedSlug = slugify(productName);

    const existingProduct = await Product.collection().findOne({ 
      slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') } 
    });

    if (!existingProduct) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Product does not exist, you can create it'
      });
    }

    const alreadyListed = await SellerProduct.collection().findOne({
      productId: existingProduct.productId,
      sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
    });

    const [mainCategory, subCategory] = await Promise.all([
      existingProduct.mainCategoryId ? MainCategory.findById(existingProduct.mainCategoryId) : null,
      existingProduct.subCategoryId ? SubCategory.findById(existingProduct.subCategoryId) : null
    ]);

    res.status(200).json({
      success: true,
      exists: true,
      alreadyListed: !!alreadyListed,
      message: alreadyListed 
        ? 'You have already listed this product' 
        : 'Product exists, you can add your price and stock',
      product: {
        productId: existingProduct.productId,
        productName: existingProduct.productName,
        slug: existingProduct.slug,
        description: existingProduct.description,
        shortDescription: existingProduct.shortDescription,
        images: existingProduct.images,
        mainCategoryId: existingProduct.mainCategoryId,
        subCategoryId: existingProduct.subCategoryId,
        mainCategoryName: mainCategory ? mainCategory.name : null,
        subCategoryName: subCategory ? subCategory.name : null,
        attributes: existingProduct.attributes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
