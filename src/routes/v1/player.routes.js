const express = require('express');
const router = express.Router();
const { getAllPlayers } = require('../../controllers/playerController');

router.get('/players', getAllPlayers);

module.exports = router;