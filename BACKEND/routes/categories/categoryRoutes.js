const express = require('express');
const router = express.Router();
const adminCategoryController = require('../../controllers/categories/admin/categoryController');
const websiteCategoryController = require('../../controllers/categories/website/categoryController');
const authmiddleware = require('../../middleware/authMiddleware');
const categoryUpload = require('../../middleware/categoryUploadMiddleware');

// --- MAIN CATEGORY ROUTES ---
router.post('/main', authmiddleware, categoryUpload.single('image'), adminCategoryController.createMainCategory);
router.put('/main/:id', authmiddleware, categoryUpload.single('image'), adminCategoryController.updateMainCategory);
router.delete('/main/:id',authmiddleware, adminCategoryController.deleteMainCategory);
router.get('/main', adminCategoryController.getMainCategories);

// --- SUBCATEGORY ROUTES ---
router.post('/sub',authmiddleware, adminCategoryController.createSubcategory);
router.put('/sub/:id', authmiddleware, adminCategoryController.updateSubcategory);
router.delete('/sub/:id', authmiddleware, adminCategoryController.deleteSubcategory);
router.get('/sub/:parentId', adminCategoryController.getSubcategoriesByParent);
router.post('/sub/:id/attributes', adminCategoryController.addSubcategoryAttributes);

// --- WEBSITE/PUBLIC ROUTES ---
router.get('/', websiteCategoryController.getCategories);
router.get('/subcategory/:parentId', websiteCategoryController.getSubcategoriesByParent);
router.get('/subcategory/:id/attributes', websiteCategoryController.getSubcategoryAttributes);

module.exports = router;
