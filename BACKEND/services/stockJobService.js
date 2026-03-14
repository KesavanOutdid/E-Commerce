const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');
const NotificationService = require('./notificationService');
const logger = require('../utils/logger');

const LOW_STOCK_THRESHOLD = 5;

/**
 * Service to check for low stock and notify admins/sellers
 */
class StockJobService {
  static async checkLowStock() {
    try {
      logger.info('Running low stock check...');
      
      const variants = await ProductVariant.collection().find({
        stock: { $lte: LOW_STOCK_THRESHOLD },
        status: true
      }).toArray();

      for (const variant of variants) {
        // Find product name
        const product = await Product.findById(variant.productId);
        const productName = product ? product.productName : 'Unknown Product';

        // Notify Admin
        await NotificationService.notifyLowStock(
          'admin',
          null,
          variant.productId,
          productName,
          variant.variantId,
          variant.stock
        );

        // Notify Seller if sellerId exists
        if (variant.sellerId) {
          await NotificationService.notifyLowStock(
            'seller',
            variant.sellerId.toString(),
            variant.productId,
            productName,
            variant.variantId,
            variant.stock
          );
        }
      }

      logger.info(`Low stock check completed. Found ${variants.length} items.`);
    } catch (error) {
      logger.error('Error in low stock check job:', error);
    }
  }

  static start(intervalMs = 3600000) { // Default 1 hour
    logger.info(`Starting stock job service with interval ${intervalMs}ms`);
    // Run once on start
    this.checkLowStock();
    // Then set interval
    return setInterval(() => this.checkLowStock(), intervalMs);
  }
}

module.exports = StockJobService;
