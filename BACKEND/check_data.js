const { connectToDatabase } = require('./config/db');
const MainCategory = require('./models/MainCategory');
const SubCategory = require('./models/SubCategory');

async function check() {
  try {
    await connectToDatabase();
    const mains = await MainCategory.find();
    const subs = await SubCategory.find();
    console.log('Main Categories Count:', mains.length);
    console.log('Sub Categories Count:', subs.length);
    if (subs.length > 0) console.log('First Sub:', subs[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();