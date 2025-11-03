import express from 'express';
import venuesController from '../controllers/venuesController.js';

const router = express.Router();
// Định tuyến cho Venues
router.get('/', venuesController.getAllVenues);          // GET /api/venues
router.get('/:id', venuesController.getVenueById);      // GET /api/venues/:id
router.post('/', venuesController.createVenue);          // POST /api/venues
router.put('/:id', venuesController.updateVenue);       // PUT /api/venues/:id
router.delete('/:id', venuesController.deleteVenue);    // DELETE /api/venues/:id

router.post('/import', venuesController.importVenuesFromLeague); // POST /api/venues/import-from-league
export default router;