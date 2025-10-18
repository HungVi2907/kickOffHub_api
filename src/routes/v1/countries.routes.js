const express = require('express');
const router = express.Router();
const { countriesController } = require('../../controllers');

router.get('/', countriesController.listCountries);
router.get('/:countryId', countriesController.getCountryById);
router.post('/', countriesController.createCountry);
router.put('/:countryId', countriesController.updateCountry);
router.delete('/:countryId', countriesController.deleteCountry);
router.post('/sync/api-football', countriesController.syncCountriesFromApi);

module.exports = router;
