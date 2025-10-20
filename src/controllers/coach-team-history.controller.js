// Controller for Coach Team History
/* coach-team-history design database structure
    CREATE TABLE coach_team_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    team_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (coach_id) REFERENCES coaches(coach_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    -- Đảm bảo một huấn luyện viên không có hai bản ghi trùng lặp cho cùng một đội vào cùng một thời điểm
    UNIQUE KEY `coach_team_period` (coach_id, team_id, start_date)
) ENGINE=InnoDB;
 */

const db = require('../config/db');

const listCoachTeamHistory = async (req, res) => {
  try {
    const { coachId, teamId } = req.query;
    let sql = 'SELECT history_id, coach_id, team_id, start_date, end_date FROM coach_team_history';
    const params = [];

    if (coachId || teamId) {
      const conditions = [];
      if (coachId) {
        conditions.push('coach_id = ?');
        params.push(coachId);
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
    res.status(500).json({ error: 'Failed to load coach team history', details: error.message });
  }
};

const getCoachTeamHistoryEntry = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT history_id, coach_id, team_id, start_date, end_date FROM coach_team_history WHERE history_id = ? LIMIT 1',
      [req.params.historyId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Coach team history entry not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load coach team history entry', details: error.message });
  }
};

const createCoachTeamHistoryEntry = async (req, res) => {
  const { coach_id: coachId, team_id: teamId, start_date: startDate, end_date: endDate } = req.body;

  try {
    await db.query(
      'INSERT INTO coach_team_history (coach_id, team_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [coachId, teamId, startDate, endDate]
    );

    res.status(201).json({ message: 'Coach team history entry created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coach team history entry', details: error.message });
  }
};

const updateCoachTeamHistoryEntry = async (req, res) => {
  const { start_date: startDate, end_date: endDate } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE coach_team_history SET start_date = ?, end_date = ? WHERE history_id = ?',
      [startDate, endDate, req.params.historyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Coach team history entry not found' });
    }

    res.json({ message: 'Coach team history entry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coach team history entry', details: error.message });
  }
};

const deleteCoachTeamHistoryEntry = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM coach_team_history WHERE history_id = ?',
      [req.params.historyId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Coach team history entry not found' });
    }

    res.json({ message: 'Coach team history entry removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coach team history entry', details: error.message });
  }
};

module.exports = {
  listCoachTeamHistory,
  getCoachTeamHistoryEntry,
  createCoachTeamHistoryEntry,
  updateCoachTeamHistoryEntry,
  deleteCoachTeamHistoryEntry
};
