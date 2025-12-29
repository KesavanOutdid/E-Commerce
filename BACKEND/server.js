const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./config/db');
const { setupSwagger } = require('./config/swagger');
const { connectRedis, closeRedis } = require('./services/redisService');
const { verifyEmailConnection } = require('./services/emailService');
const { startEmailJobService } = require('./services/emailJobService');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

dotenv.config();

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

const cartRoutes = require('./routes/cart/cartRoutes');
const orderRoutes = require('./routes/orders/orderRoutes');
const paymentRoutes = require('./routes/payments/paymentRoutes');

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

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

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info('Starting E-Commerce API Server...');

    await connectToDatabase();
    logger.info('✓ Database connected');

    try {
      await connectRedis();
      logger.info('✓ Redis connected');
    } catch (error) {
      logger.warn('Redis connection failed. Continuing without Redis caching.');
    }

    try {
      await verifyEmailConnection();
      logger.info('✓ Email service verified');
    } catch (error) {
      logger.warn('Email service verification failed. Email features may not work.');
    }

    try {
      await startEmailJobService();
      logger.info('✓ Email job service started');
    } catch (error) {
      logger.warn('Email job service failed to start. Background email processing disabled.');
    }

    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Swagger documentation available at http://localhost:${PORT}/api-docs`);
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
