const express = require('express');
const router = express.Router();
// const authMiddleware = require('../../middleware/authMiddleware');
const authMiddleware=require('../../../BACKEND/middleware/authMiddleware')
const adminCategoryController = require('../../controllers/categories/admin/categoryController');
const websiteCategoryController = require('../../controllers/categories/website/categoryController');

// Admin/Seller Routes
router.post('/', authMiddleware, adminCategoryController.createCategory);
router.put('/:id', authMiddleware, adminCategoryController.updateCategory);
router.delete('/:id', authMiddleware, adminCategoryController.deleteCategory);
router.post('/:categoryId/attributes', authMiddleware, adminCategoryController.addAttributes);

// Website/Public Routes
router.get('/', websiteCategoryController.getCategories);
router.get('/:id', websiteCategoryController.getCategoryById);

module.exports = router;
