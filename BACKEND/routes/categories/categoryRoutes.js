const express = require('express');
const router = express.Router();
const adminCategoryController = require('../../controllers/categories/admin/categoryController');
const websiteCategoryController = require('../../controllers/categories/website/categoryController');

// --- MAIN CATEGORY ROUTES ---
router.post('/main', adminCategoryController.createMainCategory);
router.put('/main/:id', adminCategoryController.updateMainCategory);
router.delete('/main/:id', adminCategoryController.deleteMainCategory);
router.get('/main', adminCategoryController.getMainCategories);

// --- SUBCATEGORY ROUTES ---
router.post('/sub', adminCategoryController.createSubcategory);
router.put('/sub/:id', adminCategoryController.updateSubcategory);
router.delete('/sub/:id', adminCategoryController.deleteSubcategory);
router.get('/sub/:parentId', adminCategoryController.getSubcategoriesByParent);
router.post('/sub/:id/attributes', adminCategoryController.addSubcategoryAttributes);

// --- WEBSITE/PUBLIC ROUTES ---
router.get('/', websiteCategoryController.getCategories);
router.get('/subcategory/:parentId', websiteCategoryController.getSubcategoriesByParent);
router.get('/subcategory/:id/attributes', websiteCategoryController.getSubcategoryAttributes);

module.exports = router;
