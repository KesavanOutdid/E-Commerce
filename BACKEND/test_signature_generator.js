const crypto = require('crypto');
require('dotenv').config();

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n❌ Usage: node test_signature_generator.js <razorpay_order_id> <razorpay_payment_id>\n');
  console.log('Example:');
  console.log('  node test_signature_generator.js order_S070eZYZMnpi1r pay_TestPayment12345\n');
  process.exit(1);
}

const razorpay_order_id = args[0];
const razorpay_payment_id = args[1];
const razorpay_key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpay_key_secret) {
  console.log('\n❌ RAZORPAY_KEY_SECRET not found in .env file\n');
  process.exit(1);
}

const signature = crypto
  .createHmac('sha256', razorpay_key_secret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

console.log('\n✅ Razorpay Signature Generated Successfully!\n');
console.log('Order ID:  ', razorpay_order_id);
console.log('Payment ID:', razorpay_payment_id);
console.log('Signature: ', signature);
console.log('\n📋 Use this in your verify request:\n');
console.log(JSON.stringify({
  razorpay_order_id: razorpay_order_id,
  razorpay_payment_id: razorpay_payment_id,
  razorpay_signature: signature
}, null, 2));
console.log('');
