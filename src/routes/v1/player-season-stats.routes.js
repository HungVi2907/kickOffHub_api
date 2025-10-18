const express = require('express');
const router = express.Router();
const { playerSeasonStatsController } = require('../../controllers');

router.get('/', playerSeasonStatsController.listPlayerSeasonStats);
router.get('/:statId', playerSeasonStatsController.getPlayerSeasonStatsById);
router.post('/', playerSeasonStatsController.upsertPlayerSeasonStats);
router.put('/:statId', (req, res, next) => {
  req.body.stat_id = req.params.statId;
  return playerSeasonStatsController.upsertPlayerSeasonStats(req, res, next);
});
router.delete('/:statId', playerSeasonStatsController.deletePlayerSeasonStats);

module.exports = router;
