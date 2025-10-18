const db = require('../config/db');

const listTeams = async (req, res) => {
  try {
    const { countryId } = req.query;
    const sql = countryId
      ? 'SELECT team_id, name, code, country_id, founded_year, venue_id, is_national, logo_url FROM teams WHERE country_id = ? ORDER BY name'
      : 'SELECT team_id, name, code, country_id, founded_year, venue_id, is_national, logo_url FROM teams ORDER BY name';
    const params = countryId ? [countryId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teams', details: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT team_id, name, code, country_id, founded_year, venue_id, is_national, logo_url FROM teams WHERE team_id = ? LIMIT 1',
      [req.params.teamId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load team', details: error.message });
  }
};

const createTeam = async (req, res) => {
  const {
    team_id: teamId,
    name,
    code,
    country_id: countryId,
    founded_year: foundedYear,
    venue_id: venueId,
    is_national: isNational,
    logo_url: logoUrl
  } = req.body;

  try {
    await db.query(
      'INSERT INTO teams (team_id, name, code, country_id, founded_year, venue_id, is_national, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teamId, name, code, countryId, foundedYear, venueId, isNational, logoUrl]
    );

    res.status(201).json({ message: 'Team created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team', details: error.message });
  }
};

const updateTeam = async (req, res) => {
  const { name, code, country_id: countryId, founded_year: foundedYear, venue_id: venueId, is_national: isNational, logo_url: logoUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE teams SET name = ?, code = ?, country_id = ?, founded_year = ?, venue_id = ?, is_national = ?, logo_url = ? WHERE team_id = ?',
      [name, code, countryId, foundedYear, venueId, isNational, logoUrl, req.params.teamId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team', details: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM teams WHERE team_id = ?',
      [req.params.teamId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team', details: error.message });
  }
};

module.exports = {
  listTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
};
