const { getDB, connectToDatabase } = require('./config/db');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkProduct() {
  await connectToDatabase();
  const db = getDB();
  const productId = "dad6b4e2-5524-4672-9b2e-ffd221daa559";
  
  const product = await db.collection('products').findOne({ 
    $or: [{ _id: productId }, { productId: productId }] 
  });
  
  console.log("Product:", JSON.stringify(product, null, 2));
  
  if (product) {
    const coupons = await db.collection('coupons').find({
      "applicableTo.ids": productId
    }).toArray();
    console.log("Coupons for this product:", JSON.stringify(coupons, null, 2));
  }
  
  process.exit();
}

checkProduct();
