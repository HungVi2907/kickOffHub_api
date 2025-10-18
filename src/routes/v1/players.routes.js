const express = require('express');
const router = express.Router();
const {
  playersController,
  playerHistoryController,
  playerTrophiesController,
  playerInjuriesController,
  transfersController,
  playerMatchStatsController,
  playerSeasonStatsController
} = require('../../controllers');

router.get('/', playersController.listPlayers);
router.get('/:playerId', playersController.getPlayerById);
router.post('/', playersController.createPlayer);
router.put('/:playerId', playersController.updatePlayer);
router.delete('/:playerId', playersController.deletePlayer);

router.get('/:playerId/history', (req, res) => {
  req.query.playerId = req.params.playerId;
  return playerHistoryController.listPlayerHistory(req, res);
});

router.get('/:playerId/trophies', (req, res) => {
  req.query.playerId = req.params.playerId;
  return playerTrophiesController.listPlayerTrophies(req, res);
});

router.get('/:playerId/injuries', (req, res) => {
  req.query.playerId = req.params.playerId;
  return playerInjuriesController.listPlayerInjuries(req, res);
});

router.get('/:playerId/transfers', (req, res) => {
  req.query.playerId = req.params.playerId;
  return transfersController.listTransfers(req, res);
});

router.get('/:playerId/match-stats', (req, res) => {
  req.query.playerId = req.params.playerId;
  return playerMatchStatsController.listPlayerMatchStats(req, res);
});

router.get('/:playerId/season-stats', (req, res) => {
  req.query.playerId = req.params.playerId;
  return playerSeasonStatsController.listPlayerSeasonStats(req, res);
});

module.exports = router;
