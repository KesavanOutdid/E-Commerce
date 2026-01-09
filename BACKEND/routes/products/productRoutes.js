const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const productUpload = require('../../middleware/productUploadMiddleware');
const adminProductController = require('../../controllers/products/admin/productController');
const sellerProductController = require('../../controllers/products/seller/productController');
const websiteProductController = require('../../controllers/products/website/productController');

// Admin Routes
router.post('/admin', authMiddleware, productUpload.array('images', 10), adminProductController.createProduct);
router.post('/admin/add-variant/:masterProductId', authMiddleware, productUpload.array('images', 10), adminProductController.addVariant);
router.get('/admin/getproducts', authMiddleware, adminProductController.getProducts);
router.get('/admin/seller-products', authMiddleware, adminProductController.getAllSellerProducts);
router.get('/admin/:id', authMiddleware, adminProductController.getProductById);
router.put('/admin/:id', authMiddleware, productUpload.array('images', 10), adminProductController.updateProduct);
router.put('/admin/update-approval/:id', authMiddleware, adminProductController.updateApprovalStatus);
router.delete('/admin/:id', authMiddleware, adminProductController.deleteProduct);

// Seller Routes
router.post('/seller', authMiddleware, productUpload.array('images', 10), sellerProductController.createProduct);
router.post('/seller/add-variant/:masterProductId', authMiddleware, productUpload.array('images', 10), sellerProductController.addVariant);
router.get('/seller/getproducts', authMiddleware, sellerProductController.getProducts);
router.get('/seller/:id', authMiddleware, sellerProductController.getProductById);
router.put('/seller/:id', authMiddleware, productUpload.array('images', 10), sellerProductController.updateProduct);
router.delete('/seller/:id', authMiddleware, sellerProductController.deleteProduct);
router.post('/seller/check-slug', authMiddleware, sellerProductController.checkProductBySlug);

// Website/Public Routes
// router.get('/', websiteProductController.getProducts);
// router.get('/best-sellers', websiteProductController.getBestSellers);
// router.get('/search', websiteProductController.searchProducts);
// router.get('/search/suggestions', websiteProductController.getSearchSuggestions);
// router.get('/subcategory/:subCategoryId', websiteProductController.getProductsBySubCategory);
// router.get('/:id', websiteProductController.getProductById);

module.exports = router;
