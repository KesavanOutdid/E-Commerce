const { connectToDatabase } = require('./BACKEND/config/db');
async function check() {
  try {
    const db = await connectToDatabase();
    const coupons = await db.collection('coupons').find().toArray();
    console.log(JSON.stringify(coupons, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
