const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const searchController = require('../../controllers/search/globalSearchController');

router.get('/global', authMiddleware, searchController.globalSearch);

module.exports = router;
