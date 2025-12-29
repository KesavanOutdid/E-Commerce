const Cart = require('../../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findByUserId(req.userId);
    if (!cart) {
      return res.status(200).json({ 
        success: true, 
        data: { items: [], status: 'active' } 
      });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCart = async (req, res) => {
  try {
    const cartData = {
      userId: req.userId,
      items: req.body.items || [],
      status: 'active',
      createdBy: req.userId,
      updatedBy: req.userId
    };
    const cart = await Cart.create(cartData);
    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, qty, price } = req.body;
    
    if (!productId || !qty || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'productId, qty, and price are required' 
      });
    }

    const cart = await Cart.addItem(req.userId, { productId, qty, price });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.removeItem(req.userId, productId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateItemQty = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid quantity is required' 
      });
    }

    const cart = await Cart.updateItemQty(req.userId, productId, qty);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.clearCart(req.userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.userId
    };
    const cart = await Cart.update(id, updateData);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    await Cart.delete(id);
    res.status(200).json({ success: true, message: 'Cart deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
