const Order = require('../../models/Order');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Product = require('../../models/Product');
const MainCategory = require('../../models/MainCategory');
const { ObjectId } = require('mongodb');

const getTimeFilter = (filter, startDate, endDate) => {
    const now = new Date();
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (filter) {
        case 'today':
            // start is already today 00:00
            break;
        case 'thisWeek':
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            break;
        case 'thisMonth':
            start.setDate(1);
            break;
        case 'thisYear':
            start.setMonth(0, 1);
            break;
        case 'custom':
            if (startDate) start = new Date(startDate);
            const end = endDate ? new Date(endDate) : new Date();
            return { start, end };
        default:
            return { start: null, end: now };
    }
    return { start, end: now };
};

const fillChartGaps = (data, filter, start, end) => {
    const filledData = [];
    const current = new Date(start);
    
    while (current <= end) {
        let label;
        if (filter === 'today') {
            label = current.getHours().toString().padStart(2, '0') + ':00';
            current.setHours(current.getHours() + 1);
        } else if (filter === 'thisYear') {
            label = current.toISOString().substring(0, 7); // YYYY-MM
            current.setMonth(current.getMonth() + 1);
        } else {
            label = current.toISOString().substring(0, 10); // YYYY-MM-DD
            current.setDate(current.getDate() + 1);
        }

        const existing = data.find(d => d._id === label);
        filledData.push({
            _id: label,
            revenue: existing ? existing.revenue : 0,
            orders: existing ? existing.orders : 0
        });

        if (filter === 'today' && current.getDate() !== new Date(start).getDate()) break;
    }
    return filledData;
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { filter = 'thisMonth', startDate, endDate } = req.query;
        const { start, end } = getTimeFilter(filter, startDate, endDate);
        const matchQuery = start ? { createdAt: { $gte: start, $lte: end } } : {};

        // 1. Summary Stats - Optimized with parallel queries
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            revenueData,
            totalRoles,
            successfulOrdersData,
            orderStatusData
        ] = await Promise.all([
            User.collection().countDocuments(),
            Product.collection().countDocuments(),
            Order.collection().countDocuments(),
            Order.collection().aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
            ]).toArray(),
            Role.collection().countDocuments(),
            Order.collection().aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $count: 'total' }
            ]).toArray(),
            Order.collection().aggregate([
                { $match: matchQuery },
                { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
            ]).toArray()
        ]);

        const totalRevenue = revenueData[0]?.totalRevenue || 0;
        const successfulOrders = successfulOrdersData[0]?.total || 0;
        const orderStatusBreakdown = orderStatusData.reduce((acc, item) => {
            acc[item._id || 'pending'] = item.count;
            return acc;
        }, {});

        // 2. Revenue Graph Data
        let groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        if (filter === 'thisYear') groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        if (filter === 'today') groupBy = { $dateToString: { format: "%H:00", date: "$createdAt" } };

        const rawChartData = await Order.collection().aggregate([
            { $match: { ...matchQuery, paymentStatus: 'completed' } },
            { $group: { _id: groupBy, revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        const revenueChart = fillChartGaps(rawChartData, filter, start || new Date(0), end);

        // 3. Best Sellers - Optimized with $lookup to avoid N+1
        const bestSellers = await Order.collection().aggregate([
            { $match: { ...matchQuery, paymentStatus: 'completed' } },
            { $unwind: '$items' },
            { $group: { 
                _id: '$items.sellerId', 
                totalSales: { $sum: '$items.totalPrice' }, 
                orderCount: { $sum: 1 } 
            } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    let: { sellerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$sellerId'] } } },
                        { $limit: 1 }
                    ],
                    as: 'sellerInfo'
                }
            },
            { $unwind: { path: '$sellerInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    totalSales: 1,
                    orderCount: 1,
                    sellerName: {
                        $cond: [
                            { $and: [{ $ne: ['$sellerInfo', null] }, { $ne: ['$sellerInfo.firstName', null] }] },
                            { $concat: ['$sellerInfo.firstName', ' ', '$sellerInfo.lastName'] },
                            'Unknown Seller'
                        ]
                    },
                    shopName: { $ifNull: ['$sellerInfo.shopName', 'Outdid'] }
                }
            }
        ]).toArray();

        // 4. Best Products - Optimized with $lookup
        const bestProducts = await Order.collection().aggregate([
            { $match: { ...matchQuery, paymentStatus: 'completed' } },
            { $unwind: '$items' },
            { $group: { 
                _id: '$items.productId', 
                totalSales: { $sum: '$items.totalPrice' }, 
                quantity: { $sum: '$items.qty' } 
            } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    totalSales: 1,
                    quantity: 1,
                    productName: { $ifNull: ['$productInfo.productName', 'Unknown Product'] },
                    image: { $arrayElemAt: ['$productInfo.images', 0] }
                }
            }
        ]).toArray();

        // 5. Best Categories with nested top products - Optimized
        const bestCategoriesRaw = await Order.collection().aggregate([
            { $match: { ...matchQuery, paymentStatus: 'completed' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: 'productId',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            { $group: { 
                _id: '$productInfo.mainCategoryId', 
                totalSales: { $sum: '$items.totalPrice' }, 
                count: { $sum: 1 } 
            } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]).toArray();

        // Fetch category names in one query
        const categoryIds = bestCategoriesRaw.map(c => c._id);
        const categoryMap = new Map();
        if (categoryIds.length > 0) {
            const categories = await MainCategory.collection()
                .find({ categoryId: { $in: categoryIds } })
                .toArray();
            categories.forEach(cat => categoryMap.set(cat.categoryId, cat.name || 'Unknown Category'));
        }

        // Get top products per category with optimized aggregation
        const bestCategories = await Promise.all(
            bestCategoriesRaw.map(async (c) => {
                const categoryTopProducts = await Order.collection().aggregate([
                    { $match: { ...matchQuery, paymentStatus: 'completed' } },
                    { $unwind: '$items' },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'items.productId',
                            foreignField: 'productId',
                            as: 'p'
                        }
                    },
                    { $unwind: '$p' },
                    { $match: { 'p.mainCategoryId': c._id } },
                    { $group: { 
                        _id: '$items.productId', 
                        name: { $first: '$p.productName' }, 
                        sales: { $sum: '$items.totalPrice' },
                        qty: { $sum: '$items.qty' }
                    } },
                    { $sort: { sales: -1 } },
                    { $limit: 3 }
                ]).toArray();

                return {
                    ...c,
                    categoryName: categoryMap.get(c._id) || 'Unknown Category',
                    topProducts: categoryTopProducts
                };
            })
        );

        // 6. Role Distribution - Simplified aggregation
        const roleDistribution = await User.collection().aggregate([
            { $unwind: '$roles' },
            {
                $group: {
                    _id: '$roles',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: '_id',
                    foreignField: 'roleId',
                    as: 'roleInfo'
                }
            },
            { $unwind: { path: '$roleInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    roleId: '$_id',
                    roleName: { $ifNull: ['$roleInfo.roleName', 'Unknown Role'] },
                    count: 1
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        res.set('Cache-Control', 'public, max-age=300');

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    totalRoles,
                    successfulOrders,
                    orderStatusBreakdown
                },
                charts: {
                    revenueChart
                },
                topPerformers: {
                    bestSellers,
                    bestProducts,
                    bestCategories
                },
                userStats: {
                    roleDistribution
                }
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
