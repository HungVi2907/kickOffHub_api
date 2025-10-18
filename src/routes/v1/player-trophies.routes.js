const express = require('express');
const router = express.Router();
const { playerTrophiesController } = require('../../controllers');

router.get('/', playerTrophiesController.listPlayerTrophies);
router.get('/:trophyId', playerTrophiesController.getPlayerTrophyById);
router.post('/', playerTrophiesController.createPlayerTrophy);
router.put('/:trophyId', playerTrophiesController.updatePlayerTrophy);
router.delete('/:trophyId', playerTrophiesController.deletePlayerTrophy);

module.exports = router;
