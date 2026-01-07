const express = require('express');
const router = express.Router();
const contactController = require('../../../controllers/contact/seller/contactController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.post('/', contactController.createContact);

router.get('/', authMiddleware, contactController.getContacts);
router.get('/:id', authMiddleware, contactController.getContactById);
router.put('/:id/status', authMiddleware, contactController.updateContactStatus);
router.delete('/:id', authMiddleware, contactController.deleteContact);

module.exports = router;
