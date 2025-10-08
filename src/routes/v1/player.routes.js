const express = require('express');
const router = express.Router();
const { getAllPlayers, addPlayer, deletePlayer, updatePlayer, getPlayerProfiletest } = require('../../controllers/playerController');

router.get('/player', getAllPlayers);

router.get('/playerapi', getPlayerProfiletest);

router.post('/player', addPlayer);

router.delete('/player/:id', deletePlayer);

router.put('/player/:id', updatePlayer);

module.exports = router;