const { getDB, connectToDatabase } = require('./config/db');
const { ObjectId } = require('mongodb');
(async () => {
    try {
        await connectToDatabase();
        const db = getDB();
        const seller = await db.collection('sellers').findOne({ _id: new ObjectId('6971d1f78dccf457a0004fb5') });
        console.log('--- Seller 6971d1f78dccf457a0004fb5 ---');
        console.log(JSON.stringify(seller, null, 2));
        
        const user = await db.collection('users').findOne({ userId: '57585973-711b-477e-b12d-db54e583e994' });
        console.log('\n--- User for product (57585973-711b-477e-b12d-db54e583e994) ---');
        console.log(JSON.stringify(user, null, 2));

        if (user) {
            const userSeller = await db.collection('sellers').findOne({ userId: user.userId });
             console.log('\n--- Seller for that user ---');
             console.log(JSON.stringify(userSeller, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
