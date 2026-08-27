const { connectToDatabase } = require('../config/db');

async function updateAdmin() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { email: 'admin@gmail.com' },
      { $set: { roles: [1, 2, 3] } }
    );
    console.log('✅ Updated admin@gmail.com roles to [1, 2, 3]. Modified count:', result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin roles:', err);
    process.exit(1);
  }
}

updateAdmin();
