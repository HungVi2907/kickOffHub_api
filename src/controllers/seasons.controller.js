const db = require('../config/db');

const listSeasons = async (req, res) => {
  try {
    const { leagueId } = req.query;
    const sql = leagueId
      ? 'SELECT league_id, `year`, start_date, end_date FROM seasons WHERE league_id = ? ORDER BY `year` DESC'
      : 'SELECT league_id, `year`, start_date, end_date FROM seasons ORDER BY league_id, `year` DESC';
    const params = leagueId ? [leagueId] : [];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load seasons', details: error.message });
  }
};

const getSeason = async (req, res) => {
  const { leagueId, year } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT league_id, `year`, start_date, end_date FROM seasons WHERE league_id = ? AND `year` = ? LIMIT 1',
      [leagueId, year]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load season', details: error.message });
  }
};

const createSeason = async (req, res) => {
  const { league_id: leagueId, year, start_date: startDate, end_date: endDate } = req.body;

  try {
    await db.query(
      'INSERT INTO seasons (league_id, `year`, start_date, end_date) VALUES (?, ?, ?, ?)',
      [leagueId, year, startDate, endDate]
    );

    res.status(201).json({ message: 'Season created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create season', details: error.message });
  }
};

const updateSeason = async (req, res) => {
  const { start_date: startDate, end_date: endDate } = req.body;
  const { leagueId, year } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE seasons SET start_date = ?, end_date = ? WHERE league_id = ? AND `year` = ?',
      [startDate, endDate, leagueId, year]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json({ message: 'Season updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update season', details: error.message });
  }
};

const deleteSeason = async (req, res) => {
  const { leagueId, year } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM seasons WHERE league_id = ? AND `year` = ?',
      [leagueId, year]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json({ message: 'Season removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete season', details: error.message });
  }
};

module.exports = {
  listSeasons,
  getSeason,
  createSeason,
  updateSeason,
  deleteSeason
};
