const SellerProduct = require('../../../models/SellerProduct');
const Product = require('../../../models/Product');
const { deleteCachePattern } = require('../../../services/redisService');
const { ObjectId } = require('mongodb');

exports.listProduct = async (req, res) => {
  try {
    if (req.roleId !== 2) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only sellers can list products' 
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

    // Check if seller already listed this product
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
      approvalStatus: 'pending' // Usually requires admin approval for the offer
    };

    const sellerProduct = await SellerProduct.create(sellerProductData);

    await deleteCachePattern('products:list:*');

    res.status(201).json({
      success: true,
      message: 'Product listed successfully, awaiting approval',
      data: sellerProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limitNum;

    const query = { 
      sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId 
    };

    const [listings, total] = await Promise.all([
      SellerProduct.find(query, { skip, limit: limitNum }),
      SellerProduct.collection().countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      message: 'Seller listings fetched successfully',
      data: {
        listings,
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



exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await SellerProduct.findById(id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updatedListing = await SellerProduct.update(id, req.body);

    await deleteCachePattern('products:list:*');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
