const express = require('express');
const router = express.Router();
const { getCountries_test } = require('../../config/api-football');

router.get('/countries', async (req, res) => {
  try {
    const data = await getCountries_test();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;