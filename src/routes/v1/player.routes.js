const express = require('express');
const router = express.Router();
const { getAllPlayers, addPlayer, deletePlayer } = require('../../controllers/playerController');

router.get('/player', getAllPlayers);

router.post('/player', addPlayer);

router.delete('/player/:id', deletePlayer);

module.exports = router;