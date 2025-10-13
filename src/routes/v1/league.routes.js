const express = require('express');
const router = express.Router();
const leagueController = require('../../controllers/leagueController');

// Route to fetch and store leagues
router.post('/fetch', leagueController.fetchAndStoreLeagues);

// Route to just get league data from API (your original functionality)
router.get('/', async (req, res) => {
  try {
    const data = await require('../../config/api-football').getLeagues();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;