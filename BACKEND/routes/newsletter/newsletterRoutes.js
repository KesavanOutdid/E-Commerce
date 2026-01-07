const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/newsletter/newsletterController');

router.post('/subscribe', newsletterController.subscribeNewsletter);
router.get('/', newsletterController.getNewsletters);

module.exports = router;
