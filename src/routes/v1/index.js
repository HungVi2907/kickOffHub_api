const express = require('express');
const router = express.Router();

router.use('/countries', require('./countries.routes'));
router.use('/leagues', require('./leagues.routes'));
router.use('/seasons', require('./seasons.routes'));
router.use('/venues', require('./venues.routes'));
router.use('/teams', require('./teams.routes'));
router.use('/players', require('./players.routes'));
router.use('/player-history', require('./player-history.routes'));
router.use('/player-trophies', require('./player-trophies.routes'));
router.use('/player-injuries', require('./player-injuries.routes'));
router.use('/transfers', require('./transfers.routes'));
router.use('/fixtures', require('./fixtures.routes'));
router.use('/player-match-stats', require('./player-match-stats.routes'));
router.use('/player-season-stats', require('./player-season-stats.routes'));
router.use('/coaches', require('./coaches.routes'));
router.use('/coach-team-history', require('./coach-team-history.routes'));

module.exports = router;
