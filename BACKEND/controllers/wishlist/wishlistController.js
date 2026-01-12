const User = require('../../models/User');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');

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
        { _id: { $in: wishlistIds.filter(id => id.length === 24).map(id => {
          try { return require('mongodb').ObjectId(id); } catch(e) { return null; }
        }).filter(id => id !== null) } }
      ]
    });

    // Fetch product variant details (price, stock) for each product
    const productsWithDetails = await Promise.all(products.map(async (product) => {
      // Find all approved variants for this product
      const variants = await ProductVariant.collection().find({
        productId: product.productId,
        approvalStatus: 'approved',
        status: true
      }).toArray();

      if (variants.length > 0) {
        // Find the variant with the minimum price
        const bestVariant = variants.reduce((prev, curr) => {
          const prevPrice = prev.salePrice || prev.price;
          const currPrice = curr.salePrice || curr.price;
          return prevPrice < currPrice ? prev : curr;
        });

        return {
          ...product,
          price: bestVariant.price,
          salePrice: bestVariant.salePrice,
          stock: bestVariant.stock,
          variantId: bestVariant.variantId,
          hasStock: bestVariant.stock > 0,
          images: bestVariant.images && bestVariant.images.length > 0 ? bestVariant.images : (product.images || [])
        };
      } else {
        // No approved variants found
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
