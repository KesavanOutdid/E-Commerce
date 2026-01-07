const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contact/contactController');

router.post('/', contactController.createContact);
router.get('/', contactController.getContacts);

module.exports = router;
