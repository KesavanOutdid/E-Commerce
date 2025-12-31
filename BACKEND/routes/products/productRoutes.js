const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const productUpload = require('../../middleware/productUploadMiddleware');
const adminProductController = require('../../controllers/products/admin/productController');
const sellerProductController = require('../../controllers/products/seller/productController');
const websiteProductController = require('../../controllers/products/website/productController');

// Admin Routes
router.post('/admin', authMiddleware, productUpload.array('images', 10), adminProductController.createProduct);
router.get('/admin/getproducts', authMiddleware, adminProductController.getProducts);
router.get('/admin/:id', authMiddleware, adminProductController.getProductById);
router.put('/admin/:id', authMiddleware, productUpload.array('images', 10), adminProductController.updateProduct);
router.patch('/admin/:id/approval', authMiddleware, adminProductController.updateApprovalStatus);
router.delete('/admin/:id', authMiddleware, adminProductController.deleteProduct);

// Seller Routes
router.post('/seller', authMiddleware, productUpload.array('images', 10), sellerProductController.createProduct);
router.get('/seller/getproducts', authMiddleware, sellerProductController.getProducts);
router.put('/seller/:id', authMiddleware, productUpload.array('images', 10), sellerProductController.updateProduct);
router.delete('/seller/:id', authMiddleware, sellerProductController.deleteProduct);

// Website/Public Routes
router.get('/', websiteProductController.getProducts);
router.get('/subcategory/:subCategoryId', websiteProductController.getProductsBySubCategory);
router.get('/:id', websiteProductController.getProductById);

module.exports = router;
