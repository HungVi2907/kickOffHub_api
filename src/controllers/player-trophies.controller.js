const db = require('../config/db');

const listPlayerTrophies = async (req, res) => {
  try {
    const { playerId } = req.query;
    const sql = playerId
      ? 'SELECT trophy_id, player_id, league, country, season, place FROM player_trophies WHERE player_id = ? ORDER BY season DESC'
      : 'SELECT trophy_id, player_id, league, country, season, place FROM player_trophies ORDER BY season DESC';
    const params = playerId ? [playerId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player trophies', details: error.message });
  }
};

const getPlayerTrophyById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT trophy_id, player_id, league, country, season, place FROM player_trophies WHERE trophy_id = ? LIMIT 1',
      [req.params.trophyId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player trophy not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player trophy', details: error.message });
  }
};

const createPlayerTrophy = async (req, res) => {
  const { player_id: playerId, league, country, season, place } = req.body;

  try {
    await db.query(
      'INSERT INTO player_trophies (player_id, league, country, season, place) VALUES (?, ?, ?, ?, ?)',
      [playerId, league, country, season, place]
    );

    res.status(201).json({ message: 'Player trophy created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player trophy', details: error.message });
  }
};

const updatePlayerTrophy = async (req, res) => {
  const { league, country, season, place } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE player_trophies SET league = ?, country = ?, season = ?, place = ? WHERE trophy_id = ?',
      [league, country, season, place, req.params.trophyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player trophy not found' });
    }

    res.json({ message: 'Player trophy updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player trophy', details: error.message });
  }
};

const deletePlayerTrophy = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM player_trophies WHERE trophy_id = ?',
      [req.params.trophyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player trophy not found' });
    }

    res.json({ message: 'Player trophy removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player trophy', details: error.message });
  }
};

module.exports = {
  listPlayerTrophies,
  getPlayerTrophyById,
  createPlayerTrophy,
  updatePlayerTrophy,
  deletePlayerTrophy
};
