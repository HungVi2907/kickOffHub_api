const express = require('express');
const router = express.Router();
const { leaguesController, seasonsController } = require('../../controllers');

router.get('/', leaguesController.listLeagues);
router.post('/sync/api-football', leaguesController.syncLeaguesFromApi);
router.get('/:leagueId', leaguesController.getLeagueById);
router.post('/', leaguesController.createLeague);
router.put('/:leagueId', leaguesController.updateLeague);
router.delete('/:leagueId', leaguesController.deleteLeague);

router.get('/:leagueId/seasons', (req, res) => {
  req.query.leagueId = req.params.leagueId;
  return seasonsController.listSeasons(req, res);
});

module.exports = router;
