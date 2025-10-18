const db = require('../config/db');

const listFixtures = async (req, res) => {
  try {
    const { leagueId, seasonYear } = req.query;
    const conditions = [];
    const params = [];

    if (leagueId) {
      conditions.push('league_id = ?');
      params.push(leagueId);
    }
    if (seasonYear) {
      conditions.push('season_year = ?');
      params.push(seasonYear);
    }

    let sql = 'SELECT fixture_id, league_id, season_year, match_date, round, status, venue_id, home_team_id, away_team_id, home_score, away_score FROM fixtures';

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY match_date DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load fixtures', details: error.message });
  }
};

const getFixtureById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT fixture_id, league_id, season_year, match_date, round, status, venue_id, home_team_id, away_team_id, home_score, away_score FROM fixtures WHERE fixture_id = ? LIMIT 1',
      [req.params.fixtureId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load fixture', details: error.message });
  }
};

const createFixture = async (req, res) => {
  const {
    fixture_id: fixtureId,
    league_id: leagueId,
    season_year: seasonYear,
    match_date: matchDate,
    round,
    status,
    venue_id: venueId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    home_score: homeScore,
    away_score: awayScore
  } = req.body;

  try {
    await db.query(
      `INSERT INTO fixtures (fixture_id, league_id, season_year, match_date, round, status, venue_id, home_team_id, away_team_id, home_score, away_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fixtureId, leagueId, seasonYear, matchDate, round, status, venueId, homeTeamId, awayTeamId, homeScore, awayScore]
    );

    res.status(201).json({ message: 'Fixture created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fixture', details: error.message });
  }
};

const updateFixture = async (req, res) => {
  const {
    league_id: leagueId,
    season_year: seasonYear,
    match_date: matchDate,
    round,
    status,
    venue_id: venueId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    home_score: homeScore,
    away_score: awayScore
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE fixtures
       SET league_id = ?, season_year = ?, match_date = ?, round = ?, status = ?, venue_id = ?, home_team_id = ?, away_team_id = ?, home_score = ?, away_score = ?
       WHERE fixture_id = ?`,
      [leagueId, seasonYear, matchDate, round, status, venueId, homeTeamId, awayTeamId, homeScore, awayScore, req.params.fixtureId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    res.json({ message: 'Fixture updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update fixture', details: error.message });
  }
};

const deleteFixture = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM fixtures WHERE fixture_id = ?',
      [req.params.fixtureId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    res.json({ message: 'Fixture removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fixture', details: error.message });
  }
};

module.exports = {
  listFixtures,
  getFixtureById,
  createFixture,
  updateFixture,
  deleteFixture
};
