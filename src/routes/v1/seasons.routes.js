const express = require('express');
const router = express.Router();
const { seasonsController } = require('../../controllers');

router.get('/', seasonsController.listSeasons);
router.get('/:leagueId/:year', seasonsController.getSeason);
router.post('/', seasonsController.createSeason);
router.put('/:leagueId/:year', seasonsController.updateSeason);
router.delete('/:leagueId/:year', seasonsController.deleteSeason);

module.exports = router;
