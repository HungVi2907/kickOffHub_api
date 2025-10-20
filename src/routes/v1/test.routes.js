const express = require('express');
const router = express.Router();
const { getLeagues_test, getCoaches_test } = require('../../config/api-football');

router.get('/leagues', async (req, res) => {
  try {
    const data = await getLeagues_test();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/coaches', async (req, res) => {
  try {
    const data = await getCoaches_test();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;