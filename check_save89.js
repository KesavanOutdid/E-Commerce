const { getDB, connectToDatabase } = require('./BACKEND/config/db');
(async () => {
    try {
        await connectToDatabase();
        const db = getDB();
        const coupon = await db.collection('coupons').findOne({ code: 'SAVE89' });
        console.log('--- Coupon SAVE89 ---');
        console.log(JSON.stringify(coupon, null, 2));
        
        if (coupon && coupon.applicableTo && coupon.applicableTo.ids) {
            console.log('\n--- Applicable Products ---');
            const products = await db.collection('products').find({ 
                $or: [
                    { productId: { $in: coupon.applicableTo.ids } },
                    { _id: { $in: coupon.applicableTo.ids.map(id => {
                        try { return new (require('mongodb').ObjectId)(id); } catch(e) { return null; }
                    }).filter(id => id !== null) } }
                ]
            }).toArray();
            console.log(JSON.stringify(products.map(p => ({ _id: p._id, productId: p.productId, sellerId: p.sellerId, userId: p.userId })), null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
