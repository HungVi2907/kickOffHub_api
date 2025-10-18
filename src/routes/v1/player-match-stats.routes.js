const express = require('express');
const router = express.Router();
const { playerMatchStatsController } = require('../../controllers');

router.get('/', playerMatchStatsController.listPlayerMatchStats);
router.get('/:fixtureId/:playerId', playerMatchStatsController.getPlayerMatchStats);
router.post('/', playerMatchStatsController.createPlayerMatchStats);
router.put('/:fixtureId/:playerId', playerMatchStatsController.updatePlayerMatchStats);
router.delete('/:fixtureId/:playerId', playerMatchStatsController.deletePlayerMatchStats);

module.exports = router;
