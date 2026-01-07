const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const adminDashboardController = require('../../controllers/dashboard/adminDashboardController');

router.get('/admin/stats', authMiddleware, adminDashboardController.getDashboardStats);

module.exports = router;
