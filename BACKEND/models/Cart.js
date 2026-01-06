const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Cart {
  static collection() {
    return getDB().collection('carts');
  }

  static async create(cartData) {
    const cart = {
      userId: cartData.userId,
      items: [],
      status: cartData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection().insertOne(cart);
    return { ...cart, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId) {
    return await this.collection().findOne({ 
      userId: userId, 
      status: 'active' 
    });
  }

  static async findItemInCart(userId, productId) {
    const cart = await this.collection().findOne({
      userId: userId,
      status: 'active',
      'items.productId': productId
    });
    
    if (!cart) return null;
    
    const item = cart.items.find(item => item.productId === productId);
    return item || null;
  }

  static async addItem(userId, itemData, createdBy, userEmail) {
    const existingItem = await this.findItemInCart(userId, itemData.productId);
    
    if (existingItem) {
      return { alreadyExists: true, existingItem };
    }
    
    const existingCart = await this.findByUserId(userId);
    
    if (existingCart) {
      return await this.collection().findOneAndUpdate(
        { userId: userId, status: 'active' },
        { 
          $push: { 
            items: {
              sellerProductId: itemData.sellerProductId || null,
              productId: itemData.productId,
              sellerId: itemData.sellerId || null,
              productName: itemData.productName,
              qty: itemData.qty,
              price: itemData.price,
              salePrice: itemData.salePrice,
              totalPrice: itemData.totalPrice,
              gst: itemData.gst,
              subTotal: itemData.subTotal,
              images: itemData.images,
              stock: itemData.stock,
              mainCategoryId: itemData.mainCategoryId,
              subCategoryId: itemData.subCategoryId,
              createdAt: new Date(),
              createdBy: userEmail,
              updatedAt: new Date(),
              updatedBy: userEmail
            }
          },
          $set: { 
            updatedAt: new Date(),
            updatedBy: userEmail
          }
        },
        { returnDocument: 'after' }
      );
    } else {
      const newCart = {
        userId: userId,
        items: [{
          sellerProductId: itemData.sellerProductId || null,
          productId: itemData.productId,
          sellerId: itemData.sellerId || null,
          productName: itemData.productName,
          qty: itemData.qty,
          price: itemData.price,
          salePrice: itemData.salePrice,
          totalPrice: itemData.totalPrice,
          gst: itemData.gst,
          subTotal: itemData.subTotal,
          images: itemData.images,
          stock: itemData.stock,
          mainCategoryId: itemData.mainCategoryId,
          subCategoryId: itemData.subCategoryId,
          createdAt: new Date(),
          createdBy: userEmail,
          updatedAt: new Date(),
          updatedBy: userEmail
        }],
        status: 'active',
        createdAt: new Date(),
        createdBy: userEmail,
        updatedAt: new Date(),
        updatedBy: userEmail
      };
      const result = await this.collection().insertOne(newCart);
      return { ...newCart, _id: result.insertedId };
    }
  }

  static async removeItem(userId, productId, updatedBy, userEmail) {
    return await this.collection().findOneAndUpdate(
      { userId: userId, status: 'active' },
      { 
        $pull: { items: { productId: productId } },
        $set: { 
          updatedAt: new Date(),
          updatedBy: userEmail
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateItemQty(userId, productId, updateData, updatedBy, userEmail) {
    const update = { 
      'items.$.qty': updateData.qty,
      'items.$.updatedAt': new Date(),
      'items.$.updatedBy': userEmail,
      updatedAt: new Date(),
      updatedBy: userEmail
    };

    if (updateData.totalPrice !== undefined) {
      update['items.$.totalPrice'] = updateData.totalPrice;
    }
    
    if (updateData.gst !== undefined) {
      update['items.$.gst'] = updateData.gst;
    }
    
    if (updateData.subTotal !== undefined) {
      update['items.$.subTotal'] = updateData.subTotal;
    }

    if (updateData.productData) {
      update['items.$.price'] = updateData.productData.price;
      update['items.$.salePrice'] = updateData.productData.salePrice;
      update['items.$.productName'] = updateData.productData.productName;
      update['items.$.images'] = updateData.productData.images;
      update['items.$.stock'] = updateData.productData.stock;
    }

    return await this.collection().findOneAndUpdate(
      { 
        userId: userId, 
        status: 'active',
        'items.productId': productId
      },
      { 
        $set: update
      },
      { returnDocument: 'after' }
    );
  }

  static async clearCart(userId) {
    return await this.collection().deleteOne({ 
      userId: userId, 
      status: 'active' 
    });
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }
  
  static async deleteByUserId(userId) {
    return await this.collection().deleteOne({ 
      userId: userId, 
      status: 'active' 
    });
  }
}

module.exports = Cart;
