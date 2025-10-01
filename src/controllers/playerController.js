const db = require('../data/db');

// Example: Get all players
async function getAllPlayers(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM players');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}

module.exports = { getAllPlayers };