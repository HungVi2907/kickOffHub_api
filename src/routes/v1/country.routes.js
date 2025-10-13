const express = require('express');
const router = express.Router();
const countryController = require('../../controllers/countryController');

router.post('/fetch', countryController.fetchAndStoreCountries);

module.exports = router;

