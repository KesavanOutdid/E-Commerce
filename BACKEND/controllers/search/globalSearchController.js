const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const MainCategory = require('../../models/MainCategory');
const SubCategory = require('../../models/SubCategory');
const Role = require('../../models/Role');
const { ObjectId } = require('mongodb');

exports.globalSearch = async (req, res) => {
    try {
        const { query, module, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const searchRegex = new RegExp(query, 'i');

        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const results = [];
        let total = 0;

        // Helper to format results
        const formatResult = (type, item, title, subtitle, link) => ({
            type,
            id: item._id || item.productId || item.orderId || item.userId || item.roleId || item.categoryId,
            title,
            subtitle,
            link,
            originalData: item
        });

        const searchTasks = [];

        // 1. Users
        if (!module || module === 'users') {
            searchTasks.push(async () => {
                const userQuery = {
                    $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { email: searchRegex },
                        { phone: searchRegex }
                    ]
                };
                const [users, count] = await Promise.all([
                    User.collection().find(userQuery).skip(skip).limit(parseInt(limit)).toArray(),
                    User.collection().countDocuments(userQuery)
                ]);
                return {
                    type: 'users',
                    total: count,
                    data: users.map(u => formatResult(
                        'User', 
                        u, 
                        `${u.firstName || ''} ${u.lastName || ''}`.trim(), 
                        u.email, 
                        `/users/view/${u.userId || u._id}`
                    ))
                };
            });
        }

        // 2. Products
        if (!module || module === 'products') {
            searchTasks.push(async () => {
                const productQuery = {
                    $or: [
                        { productName: searchRegex },
                        { slug: searchRegex },
                        { description: searchRegex }
                    ]
                };
                const [products, count] = await Promise.all([
                    Product.collection().find(productQuery).skip(skip).limit(parseInt(limit)).toArray(),
                    Product.collection().countDocuments(productQuery)
                ]);
                return {
                    type: 'products',
                    total: count,
                    data: products.map(p => formatResult(
                        'Product', 
                        p, 
                        p.productName, 
                        `₹${p.price} | Stock: ${p.stock}`, 
                        `/products/view/${p.productId || p._id}`
                    ))
                };
            });
        }

        // 3. Orders
        if (!module || module === 'orders') {
            searchTasks.push(async () => {
                const orderQuery = {
                    $or: [
                        { orderId: searchRegex },
                        { 'shippingAddress.firstName': searchRegex },
                        { 'shippingAddress.lastName': searchRegex },
                        { paymentStatus: searchRegex },
                        { orderStatus: searchRegex }
                    ]
                };
                const [orders, count] = await Promise.all([
                    Order.collection().find(orderQuery).skip(skip).limit(parseInt(limit)).toArray(),
                    Order.collection().countDocuments(orderQuery)
                ]);
                return {
                    type: 'orders',
                    total: count,
                    data: orders.map(o => formatResult(
                        'Order', 
                        o, 
                        `Order #${o.orderId}`, 
                        `${o.paymentStatus} | ₹${o.grandTotal}`, 
                        `/orders/view/${o.orderId || o._id}`
                    ))
                };
            });
        }

        // 4. Categories
        if (!module || module === 'categories') {
            searchTasks.push(async () => {
                const mainQuery = { name: searchRegex };
                const subQuery = { name: searchRegex };
                
                const [mainCats, subCats] = await Promise.all([
                    MainCategory.collection().find(mainQuery).toArray(),
                    SubCategory.collection().find(subQuery).toArray()
                ]);

                const combined = [
                    ...mainCats.map(c => formatResult('Category', c, c.name, 'Main Category', `/categories` || `/categories/main/${c.categoryId}`)),
                    ...subCats.map(c => formatResult('SubCategory', c, c.name, 'Sub Category', `/categories` || `/categories/sub/${c.subCategoryId}`))
                ];

                return {
                    type: 'categories',
                    total: combined.length,
                    data: combined.slice(skip, skip + parseInt(limit))
                };
            });
        }

        // 5. Roles
        if (!module || module === 'roles') {
            searchTasks.push(async () => {
                const roleQuery = { roleName: searchRegex };
                const [roles, count] = await Promise.all([
                    Role.collection().find(roleQuery).skip(skip).limit(parseInt(limit)).toArray(),
                    Role.collection().countDocuments(roleQuery)
                ]);
                return {
                    type: 'roles',
                    total: count,
                    data: roles.map(r => formatResult(
                        'Role', 
                        r, 
                        r.roleName, 
                        `ID: ${r.roleId}`, 
                        `/roles`
                    ))
                };
            });
        }

        const taskResults = await Promise.all(searchTasks.map(task => task()));
        
        const responseData = {};
        taskResults.forEach(res => {
            responseData[res.type] = {
                data: res.data,
                total: res.total
            };
        });

        res.status(200).json({
            success: true,
            data: responseData,
            meta: {
                query,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
