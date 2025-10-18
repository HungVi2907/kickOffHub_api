const express = require('express');
const router = express.Router();
const { teamsController, playersController, playerHistoryController } = require('../../controllers');

router.get('/', teamsController.listTeams);
router.get('/:teamId', teamsController.getTeamById);
router.post('/', teamsController.createTeam);
router.put('/:teamId', teamsController.updateTeam);
router.delete('/:teamId', teamsController.deleteTeam);

router.get('/:teamId/players', (req, res) => {
  req.query.teamId = req.params.teamId;
  return playersController.listPlayers(req, res);
});

router.get('/:teamId/history', (req, res) => {
  req.query.teamId = req.params.teamId;
  return playerHistoryController.listPlayerHistory(req, res);
});

module.exports = router;
