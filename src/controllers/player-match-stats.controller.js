const db = require('../config/db');

const listPlayerMatchStats = async (req, res) => {
  try {
    const { fixtureId, playerId } = req.query;
    const conditions = [];
    const params = [];

    if (fixtureId) {
      conditions.push('fixture_id = ?');
      params.push(fixtureId);
    }
    if (playerId) {
      conditions.push('player_id = ?');
      params.push(playerId);
    }

    let sql = `SELECT fixture_id, player_id, team_id, minutes_played, goals, assists,
                      yellow_cards, red_cards
               FROM player_match_stats`;

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY fixture_id DESC, player_id';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player match stats', details: error.message });
  }
};

const getPlayerMatchStats = async (req, res) => {
  const { fixtureId, playerId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT fixture_id, player_id, team_id, minutes_played, goals, assists,
              yellow_cards, red_cards
       FROM player_match_stats
       WHERE fixture_id = ? AND player_id = ?
       LIMIT 1`,
      [fixtureId, playerId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player match stats not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player match stats', details: error.message });
  }
};

const createPlayerMatchStats = async (req, res) => {
  const {
    fixture_id: fixtureId,
    player_id: playerId,
    team_id: teamId,
    minutes_played: minutesPlayed,
    goals,
    assists,
    yellow_cards: yellowCards,
    red_cards: redCards
  } = req.body;

  try {
    await db.query(
      `INSERT INTO player_match_stats (fixture_id, player_id, team_id, minutes_played, goals, assists, yellow_cards, red_cards)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [fixtureId, playerId, teamId, minutesPlayed, goals, assists, yellowCards, redCards]
    );

    res.status(201).json({ message: 'Player match stats created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player match stats', details: error.message });
  }
};

const updatePlayerMatchStats = async (req, res) => {
  const {
    team_id: teamId,
    minutes_played: minutesPlayed,
    goals,
    assists,
    yellow_cards: yellowCards,
    red_cards: redCards
  } = req.body;
  const { fixtureId, playerId } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE player_match_stats
       SET team_id = ?, minutes_played = ?, goals = ?, assists = ?, yellow_cards = ?, red_cards = ?
       WHERE fixture_id = ? AND player_id = ?`,
      [teamId, minutesPlayed, goals, assists, yellowCards, redCards, fixtureId, playerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player match stats not found' });
    }

    res.json({ message: 'Player match stats updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player match stats', details: error.message });
  }
};

const deletePlayerMatchStats = async (req, res) => {
  const { fixtureId, playerId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM player_match_stats WHERE fixture_id = ? AND player_id = ?',
      [fixtureId, playerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player match stats not found' });
    }

    res.json({ message: 'Player match stats removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player match stats', details: error.message });
  }
};

module.exports = {
  listPlayerMatchStats,
  getPlayerMatchStats,
  createPlayerMatchStats,
  updatePlayerMatchStats,
  deletePlayerMatchStats
};
