const User = require('../../models/User');
const Product = require('../../models/Product');
const SellerProduct = require('../../models/SellerProduct');

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedUser = await User.addToWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const updatedUser = await User.removeFromWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user wishlist with product details
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const wishlistIds = await User.getWishlist(userId);

    if (!wishlistIds || wishlistIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist is empty',
        data: []
      });
    }

    // Fetch product details for all IDs in wishlist
    const products = await Product.find({
      $or: [
        { productId: { $in: wishlistIds } },
        { _id: { $in: wishlistIds.filter(id => id.length === 24).map(id => require('mongodb').ObjectId(id)) } }
      ]
    });

    // Fetch seller product details (price, stock) for each product
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      // Find all approved listings for this product
      const listings = await SellerProduct.collection().find({
        productId: product.productId,
        approvalStatus: 'approved',
        sellerStatus: 'active'
      }).toArray();

      if (listings.length > 0) {
        // Find the listing with the minimum price
        const bestListing = listings.reduce((prev, curr) => {
          const prevPrice = prev.salePrice || prev.price;
          const currPrice = curr.salePrice || curr.price;
          return prevPrice < currPrice ? prev : curr;
        });

        return {
          ...product,
          price: bestListing.price,
          salePrice: bestListing.salePrice,
          stock: bestListing.stock,
          sellerProductId: bestListing.sellerProductId,
          hasStock: bestListing.stock > 0
        };
      } else {
        // No approved listings found
        return {
          ...product,
          price: 0,
          salePrice: null,
          stock: 0,
          hasStock: false
        };
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: productsWithDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
