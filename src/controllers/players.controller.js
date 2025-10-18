const db = require('../config/db');

const listPlayers = async (req, res) => {
  try {
    const { teamId } = req.query;
    const sql = teamId
      ? 'SELECT player_id, first_name, last_name, birth_date, nationality, height, weight, photo_url FROM players WHERE player_id IN (SELECT player_id FROM player_team_history WHERE team_id = ? AND (end_date IS NULL OR end_date >= CURRENT_DATE())) ORDER BY last_name, first_name'
      : 'SELECT player_id, first_name, last_name, birth_date, nationality, height, weight, photo_url FROM players ORDER BY last_name, first_name';
    const params = teamId ? [teamId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load players', details: error.message });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT player_id, first_name, last_name, birth_date, nationality, height, weight, photo_url FROM players WHERE player_id = ? LIMIT 1',
      [req.params.playerId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player', details: error.message });
  }
};

const createPlayer = async (req, res) => {
  const {
    player_id: playerId,
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    nationality,
    height,
    weight,
    photo_url: photoUrl
  } = req.body;

  try {
    await db.query(
      'INSERT INTO players (player_id, first_name, last_name, birth_date, nationality, height, weight, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [playerId, firstName, lastName, birthDate, nationality, height, weight, photoUrl]
    );

    res.status(201).json({ message: 'Player created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player', details: error.message });
  }
};

const updatePlayer = async (req, res) => {
  const {
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    nationality,
    height,
    weight,
    photo_url: photoUrl
  } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE players SET first_name = ?, last_name = ?, birth_date = ?, nationality = ?, height = ?, weight = ?, photo_url = ? WHERE player_id = ?',
      [firstName, lastName, birthDate, nationality, height, weight, photoUrl, req.params.playerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player', details: error.message });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM players WHERE player_id = ?',
      [req.params.playerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player', details: error.message });
  }
};

module.exports = {
  listPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer
};
