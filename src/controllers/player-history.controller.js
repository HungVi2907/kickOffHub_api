const db = require('../config/db');

const listPlayerHistory = async (req, res) => {
  try {
    const { playerId, teamId } = req.query;
    let sql = 'SELECT history_id, player_id, team_id, start_date, end_date FROM player_team_history';
    const params = [];

    if (playerId || teamId) {
      const conditions = [];
      if (playerId) {
        conditions.push('player_id = ?');
        params.push(playerId);
      }
      if (teamId) {
        conditions.push('team_id = ?');
        params.push(teamId);
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY start_date DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player history', details: error.message });
  }
};

const getPlayerHistoryEntry = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT history_id, player_id, team_id, start_date, end_date FROM player_team_history WHERE history_id = ? LIMIT 1',
      [req.params.historyId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player history entry not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player history entry', details: error.message });
  }
};

const createPlayerHistoryEntry = async (req, res) => {
  const { player_id: playerId, team_id: teamId, start_date: startDate, end_date: endDate } = req.body;

  try {
    await db.query(
      'INSERT INTO player_team_history (player_id, team_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [playerId, teamId, startDate, endDate]
    );

    res.status(201).json({ message: 'Player history entry created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player history entry', details: error.message });
  }
};

const updatePlayerHistoryEntry = async (req, res) => {
  const { start_date: startDate, end_date: endDate } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE player_team_history SET start_date = ?, end_date = ? WHERE history_id = ?',
      [startDate, endDate, req.params.historyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player history entry not found' });
    }

    res.json({ message: 'Player history entry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player history entry', details: error.message });
  }
};

const deletePlayerHistoryEntry = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM player_team_history WHERE history_id = ?',
      [req.params.historyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player history entry not found' });
    }

    res.json({ message: 'Player history entry removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player history entry', details: error.message });
  }
};

module.exports = {
  listPlayerHistory,
  getPlayerHistoryEntry,
  createPlayerHistoryEntry,
  updatePlayerHistoryEntry,
  deletePlayerHistoryEntry
};
