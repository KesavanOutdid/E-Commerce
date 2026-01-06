const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const User = require('../../models/User');

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const cart = await Cart.findByUserId(userId);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'Your cart is empty. Start shopping to add items!',
        data: { 
          userId: userId,
          items: [], 
          status: 'active' 
        },
        pagination: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      });
    }

    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return {
            ...item,
            productStatus: 'not_found',
            available: false
          };
        }

        let finalPrice = product.price;
        let finalSalePrice = product.salePrice;
        let finalStock = product.stock;
        let sellerDetails = null;

        if (item.sellerProductId) {
          const SellerProduct = require('../../models/SellerProduct');
          const listing = await SellerProduct.findById(item.sellerProductId);
          
          if (listing) {
            finalPrice = listing.price;
            finalSalePrice = listing.salePrice;
            finalStock = listing.stock;

            if (item.sellerId) {
              const seller = await User.findByUserId(item.sellerId);
              if (seller) {
                sellerDetails = {
                  sellerId: seller.userId,
                  sellerName: seller.name || seller.email,
                  sellerEmail: seller.email
                };
              }
            }
          }
        }

        return {
          sellerProductId: item.sellerProductId || null,
          productId: item.productId,
          sellerId: item.sellerId || null,
          productName: product.productName,
          qty: item.qty,
          price: finalPrice,
          salePrice: finalSalePrice,
          totalPrice: item.totalPrice,
          gst: item.gst,
          subTotal: item.subTotal,
          images: product.images,
          stock: finalStock,
          mainCategoryId: product.mainCategoryId,
          subCategoryId: product.subCategoryId,
          description: product.description,
          shortDescription: product.shortDescription,
          slug: product.slug,
          sellerDetails: sellerDetails,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          available: finalStock >= item.qty,
          productStatus: product.status ? 'active' : 'inactive'
        };
      })
    );

    const totalItems = enrichedItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = enrichedItems.slice(startIndex, endIndex);

    res.status(200).json({ 
      success: true,
      message: 'Your cart items loaded successfully', 
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: paginatedItems,
        status: cart.status,
        createdAt: cart.createdAt,
        createdBy: cart.createdBy,
        updatedAt: cart.updatedAt,
        updatedBy: cart.updatedBy
      },
      pagination: {
        total: totalItems,
        page: page,
        limit: limit,
        pages: totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.addItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { sellerProductId, productId, sellerId, qty, totalPrice, gst, subTotal } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to add items to your cart' 
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select a product to add to cart' 
      });
    }

    if (!qty || qty < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid quantity' 
      });
    }

    if (totalPrice === undefined || gst === undefined || subTotal === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price information is missing. Please try again' 
      });
    }

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sorry, this product is no longer available' 
      });
    }

    let finalPrice = product.price;
    let finalSalePrice = product.salePrice;
    let finalStock = product.stock;

    if (sellerProductId) {
      const SellerProduct = require('../../models/SellerProduct');
      const listing = await SellerProduct.findById(sellerProductId);
      
      if (!listing) {
        return res.status(404).json({ 
          success: false, 
          message: 'Seller listing not found for this product' 
        });
      }

      if (listing.approvalStatus !== 'approved') {
        return res.status(400).json({ 
          success: false, 
          message: 'This seller listing is not yet approved' 
        });
      }

      if (listing.sellerStatus !== 'active') {
        return res.status(400).json({ 
          success: false, 
          message: 'This seller listing is currently not available' 
        });
      }

      finalPrice = listing.price;
      finalSalePrice = listing.salePrice;
      finalStock = listing.stock;

      if (finalStock < qty) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${finalStock} items available from this seller` 
        });
      }
    } else {
      if (product.stock < qty) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stock} items available in stock` 
        });
      }
    }

    const itemData = {
      sellerProductId: sellerProductId || null,
      productId: product.productId,
      sellerId: sellerId || null,
      productName: product.productName,
      qty: qty,
      price: finalPrice,
      salePrice: finalSalePrice,
      totalPrice: totalPrice,
      gst: gst,
      subTotal: subTotal,
      images: product.images,
      stock: finalStock,
      mainCategoryId: product.mainCategoryId,
      subCategoryId: product.subCategoryId
    };

    const result = await Cart.addItem(userId, itemData, userId, user.email);
    
    if (result.alreadyExists) {
      return res.status(409).json({ 
        success: false,
        message: 'This item is already in your cart',
        data: {
          productId: result.existingItem.productId,
          currentQty: result.existingItem.qty,
          suggestion: 'You can update the quantity from your cart'
        }
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Item added to your cart!', 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { sellerProductId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to manage your cart' 
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select an item to remove' 
      });
    }

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const existingCart = await Cart.findByUserId(userId);
    
    if (!existingCart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Your cart is empty' 
      });
    }

    const itemExists = existingCart.items.some(item => 
      item.productId === productId && 
      (item.sellerProductId === (sellerProductId || null))
    );
    
    if (!itemExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'This item is not in your cart' 
      });
    }

    const cart = await Cart.removeItem(userId, productId, sellerProductId || null, user.email);
    
    res.status(200).json({ 
      success: true,
      message: 'Item removed from your cart', 
      data: cart 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateItemQty = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { qty, totalPrice, gst, subTotal, sellerProductId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to update your cart' 
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select an item to update' 
      });
    }

    if (!qty || qty < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid quantity' 
      });
    }

    if (totalPrice === undefined || gst === undefined || subTotal === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price information is missing. Please try again' 
      });
    }

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const existingCart = await Cart.findByUserId(userId);
    
    if (!existingCart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Your cart is empty' 
      });
    }

    const itemExists = existingCart.items.some(item => 
      item.productId === productId && 
      (item.sellerProductId === (sellerProductId || null))
    );
    
    if (!itemExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'This item is not in your cart' 
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sorry, this product is no longer available' 
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    const updateData = {
      qty: qty,
      totalPrice: totalPrice,
      gst: gst,
      subTotal: subTotal,
      productData: {
        price: product.price,
        salePrice: product.salePrice,
        productName: product.productName,
        images: product.images,
        stock: product.stock
      }
    };

    const cart = await Cart.updateItemQty(userId, productId, sellerProductId || null, updateData, user.email);
    
    res.status(200).json({ 
      success: true,
      message: 'Your cart has been updated', 
      data: cart 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to clear your cart' 
      });
    }

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not found. Please log in again' 
      });
    }

    const existingCart = await Cart.findByUserId(userId);
    
    if (!existingCart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Your cart is already empty' 
      });
    }

    const result = await Cart.clearCart(userId);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Your cart is already empty' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Your cart has been cleared',
      data: {
        deletedCount: result.deletedCount,
        userId: userId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
