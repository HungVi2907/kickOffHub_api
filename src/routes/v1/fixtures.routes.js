const express = require('express');
const router = express.Router();
const { fixturesController, playerMatchStatsController } = require('../../controllers');

router.get('/', fixturesController.listFixtures);
router.get('/:fixtureId', fixturesController.getFixtureById);
router.post('/', fixturesController.createFixture);
router.put('/:fixtureId', fixturesController.updateFixture);
router.delete('/:fixtureId', fixturesController.deleteFixture);

router.get('/:fixtureId/player-stats', (req, res) => {
  req.query.fixtureId = req.params.fixtureId;
  return playerMatchStatsController.listPlayerMatchStats(req, res);
});

module.exports = router;
