const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Cart {
  static collection() {
    return getDB().collection('carts');
  }

  static async create(cartData) {
    const cart = {
      userId: new ObjectId(cartData.userId),
      items: cartData.items.map(item => ({
        productId: new ObjectId(item.productId),
        qty: item.qty,
        price: item.price
      })),
      status: cartData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(cartData.createdBy),
      updatedBy: new ObjectId(cartData.updatedBy)
    };
    const result = await this.collection().insertOne(cart);
    return { ...cart, _id: result.insertedId };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByUserId(userId) {
    return await this.collection().findOne({ 
      userId: new ObjectId(userId), 
      status: 'active' 
    });
  }

  static async update(id, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date()
    };
    
    if (updateData.items) {
      update.items = updateData.items.map(item => ({
        productId: new ObjectId(item.productId),
        qty: item.qty,
        price: item.price
      }));
    }

    if (updateData.updatedBy) {
      update.updatedBy = new ObjectId(updateData.updatedBy);
    }

    return await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async addItem(userId, item) {
    return await this.collection().findOneAndUpdate(
      { userId: new ObjectId(userId), status: 'active' },
      { 
        $push: { 
          items: {
            productId: new ObjectId(item.productId),
            qty: item.qty,
            price: item.price
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after', upsert: true }
    );
  }

  static async removeItem(userId, productId) {
    return await this.collection().findOneAndUpdate(
      { userId: new ObjectId(userId), status: 'active' },
      { 
        $pull: { items: { productId: new ObjectId(productId) } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  static async updateItemQty(userId, productId, qty) {
    return await this.collection().findOneAndUpdate(
      { 
        userId: new ObjectId(userId), 
        status: 'active',
        'items.productId': new ObjectId(productId)
      },
      { 
        $set: { 
          'items.$.qty': qty,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }

  static async clearCart(userId) {
    return await this.collection().findOneAndUpdate(
      { userId: new ObjectId(userId), status: 'active' },
      { 
        $set: { 
          items: [],
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
}

module.exports = Cart;
