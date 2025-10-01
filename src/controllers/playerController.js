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
async function addPlayer(req, res) {
  const { name, nationality, age, position, current_club } = req.body;

  try {
    const [result] = await db.query('INSERT INTO players (name, nationality, age, position, current_club) VALUES (?, ?, ?, ?, ?)', [name, nationality, age, position, current_club]);
    res.status(201).json({ id: result.insertId, name, nationality, age, position, current_club });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}
async function deletePlayer(req, res) {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM players WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
}
module.exports = { getAllPlayers, addPlayer, deletePlayer };