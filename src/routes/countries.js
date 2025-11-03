import express from 'express';
import CountriesController from '../controllers/countriesController.js';

const router = express.Router();

// Định tuyến cho Countries
router.get('/countries', CountriesController.getAllCountries);          // GET /api/countries
router.get('/countries/:id', CountriesController.getCountryById);      // GET /api/countries/:id
router.post('/countries', CountriesController.createCountry);          // POST /api/countries
router.put('/countries/:id', CountriesController.updateCountry);       // PUT /api/countries/:id
router.delete('/countries/:id', CountriesController.deleteCountry);    // DELETE /api/countries/:id
router.post('/countries/import', CountriesController.importFromApiFootball); // POST /api/countries/import

export default router;