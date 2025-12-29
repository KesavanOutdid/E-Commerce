const { connectToDatabase } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const defaultRoles = [
  {
    role_id: 1,
    role_name: 'Admin',
    created_by: 'system',
    created_time: new Date(),
    modified_by: null,
    modified_at: null,
    status: true
  },
  {
    role_id: 2,
    role_name: 'Seller',
    created_by: 'system',
    created_time: new Date(),
    modified_by: null,
    modified_at: null,
    status: true
  },
  {
    role_id: 3,
    role_name: 'Customer',
    created_by: 'system',
    created_time: new Date(),
    modified_by: null,
    modified_at: null,
    status: true
  }
];

const defaultAdmin = {
  userId: '00000000-0000-0000-0000-000000000001',
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@gmail.com',
  phone: null,
  password: 'admin123',
  roles: [1],
  profileImage: null,
  addresses: [],
  status: true,
  authenticator: false,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'system',
  updatedBy: 'system'
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const db = await connectToDatabase();
    
    const rolesCollection = db.collection('roles');
    const existingRole = await rolesCollection.findOne({ role_id: 1 });
    
    if (!existingRole) {
      await rolesCollection.insertMany(defaultRoles);
      console.log('✅ Roles seeded successfully');
    } else {
      console.log('⚠️  Roles already exist, skipping...');
    }
    
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: 'admin@gmail.com' });
    
    if (!existingAdmin) {
      await usersCollection.insertOne(defaultAdmin);
      console.log('✅ Default admin created successfully');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('⚠️  Admin user already exists, skipping...');
    }
    
    await rolesCollection.createIndex({ role_id: 1 }, { unique: true });
    await rolesCollection.createIndex({ status: 1 });
    
    await usersCollection.createIndex({ userId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ roles: 1 });
    await usersCollection.createIndex({ status: 1 });
    console.log('✅ Database indexes created');
    
    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
