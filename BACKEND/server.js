const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const { connectToDatabase } = require('./config/db');
const { setupSwagger } = require('./config/swagger');
const { connectRedis, closeRedis } = require('./services/redisService');
const { verifyEmailConnection } = require('./services/emailService');
const { startEmailJobService } = require('./services/emailJobService');
const { seedDatabase } = require('./scripts/seedData');
const logger = require('./utils/logger');

dotenv.config();

/* -------------------- Create logs directory -------------------- */
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/* -------------------- App Init -------------------- */
const app = express();
const requestLogger = require('./middleware/requestLogger');

/* -------------------- Middlewares -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

/* -------------------- Static Files -------------------- */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

/* -------------------- Swagger -------------------- */
setupSwagger(app);

/* -------------------- Routes -------------------- */
// Auth & Roles
const adminRoutes = require('./routes/auth/admin/adminRoutes');
const userRoutes = require('./routes/auth/user/userRoutes');
const sellerRoutes = require('./routes/auth/seller/sellerRoutes');

// Business Routes
const categoryRoutes = require('./routes/categories/categoryRoutes');
const productRoutes = require('./routes/products/productRoutes');
const cartRoutes = require('./routes/cart/cartRoutes');
const orderRoutes = require('./routes/orders/orderRoutes');
const paymentRoutes = require('./routes/payments/paymentRoutes');
const priceHistoryRoutes = require('./routes/priceHistory/priceHistoryRoutes');
const wishlistRoutes = require('./routes/wishlist');
const dashboardRoutes = require('./routes/dashboard/dashboardRoutes');
const contactSellerRoutes = require('./routes/contact/seller/contactRoutes');
const contactRoutes = require('./routes/contact/contactRoutes');
const newsletterRoutes = require('./routes/newsletter/newsletterRoutes');
const searchRoutes = require('./routes/search/searchRoutes');

/* -------------------- Route Mounting -------------------- */
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/seller', sellerRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/price-history', priceHistoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact/seller', contactSellerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/search', searchRoutes);

/* -------------------- Health & Root -------------------- */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API Server',
    services: {
      database: 'Connected',
      redis: 'Connected',
      email: 'Ready',
      swagger: '/api-docs'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/* -------------------- Server Startup -------------------- */
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info('Starting E-Commerce API Server...');

    const db = await connectToDatabase();
    logger.info('✓ Database connected');

    await seedDatabase(db);
    logger.info('✓ Database seeding completed');

    try {
      await connectRedis();
      logger.info('✓ Redis connected');
    } catch (error) {
      logger.warn('Redis connection failed. Continuing without Redis.');
    }

    try {
      await verifyEmailConnection();
      logger.info('✓ Email service verified');
    } catch (error) {
      logger.warn('Email service verification failed.');
    }

    try {
      await startEmailJobService();
      logger.info('✓ Email job service started');
    } catch (error) {
      logger.warn('Email job service failed to start.');
    }

    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Swagger docs: http://localhost:${PORT}/api-docs`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('All services started successfully!');
    });

    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await closeRedis();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
