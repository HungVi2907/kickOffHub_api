const express = require('express');
const router = express.Router();
const { venuesController } = require('../../controllers');

router.get('/', venuesController.listVenues);
router.post('/sync/api-football', venuesController.syncVenuesFromApi);
router.get('/:venueId', venuesController.getVenueById);
router.post('/', venuesController.createVenue);
router.put('/:venueId', venuesController.updateVenue);
router.delete('/:venueId', venuesController.deleteVenue);

module.exports = router;
