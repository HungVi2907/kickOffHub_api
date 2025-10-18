const db = require('../config/db');

const listLeagues = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT league_id, name, country_id, logo_url FROM leagues ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load leagues', details: error.message });
  }
};

const getLeagueById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT league_id, name, country_id, logo_url FROM leagues WHERE league_id = ? LIMIT 1',
      [req.params.leagueId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load league', details: error.message });
  }
};

const createLeague = async (req, res) => {
  const { league_id: leagueId, name, country_id: countryId, logo_url: logoUrl } = req.body;

  try {
    await db.query(
      'INSERT INTO leagues (league_id, name, country_id, logo_url) VALUES (?, ?, ?, ?)',
      [leagueId, name, countryId, logoUrl]
    );

    res.status(201).json({ message: 'League created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league', details: error.message });
  }
};

const updateLeague = async (req, res) => {
  const { name, country_id: countryId, logo_url: logoUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE leagues SET name = ?, country_id = ?, logo_url = ? WHERE league_id = ?',
      [name, countryId, logoUrl, req.params.leagueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json({ message: 'League updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update league', details: error.message });
  }
};

const deleteLeague = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM leagues WHERE league_id = ?',
      [req.params.leagueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json({ message: 'League removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete league', details: error.message });
  }
};

module.exports = {
  listLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague
};
