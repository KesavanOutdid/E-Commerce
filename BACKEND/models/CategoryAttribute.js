const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class CategoryAttribute {
  static collection() {
    return getDB().collection('category_attributes');
  }

  static async create(attributeData) {
    const attribute = {
      categoryId: new ObjectId(attributeData.categoryId),
      name: attributeData.name, // RAM, ROM, Size
      slug: attributeData.slug, // ram, rom, size
      type: attributeData.type, // string, number, boolean, select, multi-select
      options: attributeData.options || [], // for select / multi-select
      required: attributeData.required || false,
      filterable: attributeData.filterable !== undefined ? attributeData.filterable : true,
      createdAt: new Date()
    };
    const result = await this.collection().insertOne(attribute);
    return { ...attribute, _id: result.insertedId };
  }

  static async findByCategoryId(categoryId) {
    return await this.collection().find({ categoryId: new ObjectId(categoryId) }).toArray();
  }

  static async deleteByCategoryId(categoryId) {
    return await this.collection().deleteMany({ categoryId: new ObjectId(categoryId) });
  }

  static async delete(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = CategoryAttribute;
