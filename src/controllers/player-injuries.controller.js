const db = require('../config/db');

const listPlayerInjuries = async (req, res) => {
  try {
    const { playerId } = req.query;
    const sql = playerId
      ? 'SELECT injury_id, player_id, type, start_date, end_date FROM player_injuries WHERE player_id = ? ORDER BY start_date DESC'
      : 'SELECT injury_id, player_id, type, start_date, end_date FROM player_injuries ORDER BY start_date DESC';
    const params = playerId ? [playerId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player injuries', details: error.message });
  }
};

const getPlayerInjuryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT injury_id, player_id, type, start_date, end_date FROM player_injuries WHERE injury_id = ? LIMIT 1',
      [req.params.injuryId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player injury not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player injury', details: error.message });
  }
};

const createPlayerInjury = async (req, res) => {
  const { player_id: playerId, type, start_date: startDate, end_date: endDate } = req.body;

  try {
    await db.query(
      'INSERT INTO player_injuries (player_id, type, start_date, end_date) VALUES (?, ?, ?, ?)',
      [playerId, type, startDate, endDate]
    );

    res.status(201).json({ message: 'Player injury created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player injury', details: error.message });
  }
};

const updatePlayerInjury = async (req, res) => {
  const { type, start_date: startDate, end_date: endDate } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE player_injuries SET type = ?, start_date = ?, end_date = ? WHERE injury_id = ?',
      [type, startDate, endDate, req.params.injuryId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player injury not found' });
    }

    res.json({ message: 'Player injury updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player injury', details: error.message });
  }
};

const deletePlayerInjury = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM player_injuries WHERE injury_id = ?',
      [req.params.injuryId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player injury not found' });
    }

    res.json({ message: 'Player injury removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player injury', details: error.message });
  }
};

module.exports = {
  listPlayerInjuries,
  getPlayerInjuryById,
  createPlayerInjury,
  updatePlayerInjury,
  deletePlayerInjury
};
