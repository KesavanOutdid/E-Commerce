const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');
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
        let finalImages = product.images || [];
        let sellerDetails = null;
        let variantDetails = null;

        if (item.variantId) {
          const variant = await ProductVariant.findById(item.variantId);
          
          if (variant) {
            finalPrice = variant.price;
            finalSalePrice = variant.salePrice;
            finalStock = variant.stock;
            
            if (variant.images && variant.images.length > 0) {
              finalImages = variant.images;
            }

            variantDetails = {
              variantId: variant.variantId,
              attributes: variant.attributes,
              price: variant.price,
              salePrice: variant.salePrice,
              stock: variant.stock,
              images: variant.images
            };

            if (item.sellerId) {
              const seller = await User.findByUserId(item.sellerId);
              if (seller) {
                sellerDetails = {
                  sellerId: seller.userId,
                  sellerName: `${seller.firstName} ${seller.lastName}`,
                  sellerEmail: seller.email,
                  phone: seller.phone
                };
              }
            }
          }
        }

        return {
          variantId: item.variantId || null,
          productId: item.productId,
          sellerId: item.sellerId || null,
          productName: product.productName,
          qty: item.qty,
          price: finalPrice,
          salePrice: finalSalePrice,
          totalPrice: item.totalPrice,
          gst: item.gst,
          subTotal: item.subTotal,
          images: finalImages,
          productImages: product.images || [],
          stock: finalStock,
          mainCategoryId: product.mainCategoryId,
          subCategoryId: product.subCategoryId,
          description: product.description,
          shortDescription: product.shortDescription,
          slug: product.slug,
          variantDetails: variantDetails,
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
    const { variantId, productId, sellerId, qty, totalPrice, gst, subTotal, salePrice } = req.body;
    
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
    let finalSalePrice = salePrice || product.salePrice;
    let finalStock = product.stock;

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      
      if (!variant) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product variant not found' 
        });
      }

      if (variant.approvalStatus !== 'approved') {
        return res.status(400).json({ 
          success: false, 
          message: 'This variant is not yet approved' 
        });
      }

      if (!variant.status) {
        return res.status(400).json({ 
          success: false, 
          message: 'This variant is currently not available' 
        });
      }

      finalPrice = variant.price;
      finalSalePrice = variant.salePrice || variant.price;
      finalStock = variant.stock;

      if (finalStock < qty) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${finalStock} items available for this variant` 
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
      variantId: variantId || null,
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
    
    if (result.updated) {
      return res.status(200).json({ 
        success: true,
        message: result.message || 'Item quantity updated in your cart!',
        data: result.cart 
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
    const { variantId } = req.query;
    
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
      (item.variantId === (variantId || null))
    );
    
    if (!itemExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'This item is not in your cart' 
      });
    }

    const cart = await Cart.removeItem(userId, productId, variantId || null, user.email);
    
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
    const { qty, totalPrice, gst, subTotal, variantId } = req.body;

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
      (item.variantId === (variantId || null))
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

    let availableStock = product.stock || 0;
    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (variant) {
        availableStock = variant.stock !== undefined ? variant.stock : availableStock;
      }
    }

    if (availableStock > 0 && availableStock < qty) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${availableStock} items available in stock` 
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

    const cart = await Cart.updateItemQty(userId, productId, variantId || null, updateData, user.email);
    
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
