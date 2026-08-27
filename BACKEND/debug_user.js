const { getDB, connectToDatabase } = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUser() {
  await connectToDatabase();
  const db = getDB();
  const userId = "57585973-711b-477e-b12d-db54e583e994";
  
  const user = await db.collection('users').findOne({ userId: userId });
  console.log("User:", JSON.stringify(user, null, 2));
  
  const seller = await db.collection('sellers').findOne({ userId: userId });
  console.log("Seller:", JSON.stringify(seller, null, 2));
  
  process.exit();
}

checkUser();
