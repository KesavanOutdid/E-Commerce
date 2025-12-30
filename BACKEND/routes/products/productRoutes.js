const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const adminProductController = require('../../controllers/products/admin/productController');
const websiteProductController = require('../../controllers/products/website/productController');

// Admin/Seller Routes
router.post('/admin', authMiddleware, adminProductController.createAdminProduct);
router.post('/seller', authMiddleware, adminProductController.createSellerProduct);
router.get('/admin', authMiddleware, adminProductController.getProducts);
router.put('/:id', authMiddleware, adminProductController.updateProduct);
router.patch('/:id/approval', authMiddleware, adminProductController.updateApprovalStatus);
router.delete('/:id', authMiddleware, adminProductController.deleteProduct);

// Website/Public Routes
router.get('/', websiteProductController.getProducts);
router.get('/:id', websiteProductController.getProductById);

module.exports = router;
