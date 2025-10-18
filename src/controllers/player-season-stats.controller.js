const db = require('../config/db');

const listPlayerSeasonStats = async (req, res) => {
  try {
    const { playerId, teamId, leagueId, seasonYear } = req.query;
    const conditions = [];
    const params = [];

    if (playerId) {
      conditions.push('player_id = ?');
      params.push(playerId);
    }
    if (teamId) {
      conditions.push('team_id = ?');
      params.push(teamId);
    }
    if (leagueId) {
      conditions.push('league_id = ?');
      params.push(leagueId);
    }
    if (seasonYear) {
      conditions.push('season_year = ?');
      params.push(seasonYear);
    }

    let sql = `SELECT stat_id, player_id, team_id, league_id, season_year, appearences, lineups, minutes,
                      goals_total, goals_assists, goals_conceded, shots_total, shots_on,
                      passes_total, passes_key, passes_accuracy, dribbles_attempts, dribbles_success,
                      duels_total, duels_won, cards_yellow, cards_red, fouls_drawn, fouls_committed,
                      penalty_scored, penalty_missed, penalty_saved
               FROM player_season_stats`;

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY season_year DESC, player_id';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player season stats', details: error.message });
  }
};

const getPlayerSeasonStatsById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT stat_id, player_id, team_id, league_id, season_year, appearences, lineups, minutes,
              goals_total, goals_assists, goals_conceded, shots_total, shots_on,
              passes_total, passes_key, passes_accuracy, dribbles_attempts, dribbles_success,
              duels_total, duels_won, cards_yellow, cards_red, fouls_drawn, fouls_committed,
              penalty_scored, penalty_missed, penalty_saved
       FROM player_season_stats
       WHERE stat_id = ?
       LIMIT 1`,
      [req.params.statId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Player season stats not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player season stats', details: error.message });
  }
};

const upsertPlayerSeasonStats = async (req, res) => {
  const {
    stat_id: statId,
    player_id: playerId,
    team_id: teamId,
    league_id: leagueId,
    season_year: seasonYear,
    appearences,
    lineups,
    minutes,
    goals_total: goalsTotal,
    goals_assists: goalsAssists,
    goals_conceded: goalsConceded,
    shots_total: shotsTotal,
    shots_on: shotsOn,
    passes_total: passesTotal,
    passes_key: passesKey,
    passes_accuracy: passesAccuracy,
    dribbles_attempts: dribblesAttempts,
    dribbles_success: dribblesSuccess,
    duels_total: duelsTotal,
    duels_won: duelsWon,
    cards_yellow: cardsYellow,
    cards_red: cardsRed,
    fouls_drawn: foulsDrawn,
    fouls_committed: foulsCommitted,
    penalty_scored: penaltyScored,
    penalty_missed: penaltyMissed,
    penalty_saved: penaltySaved
  } = req.body;

  try {
    const sql = statId
      ? `UPDATE player_season_stats
         SET player_id = ?, team_id = ?, league_id = ?, season_year = ?, appearences = ?, lineups = ?, minutes = ?,
             goals_total = ?, goals_assists = ?, goals_conceded = ?, shots_total = ?, shots_on = ?,
             passes_total = ?, passes_key = ?, passes_accuracy = ?, dribbles_attempts = ?, dribbles_success = ?,
             duels_total = ?, duels_won = ?, cards_yellow = ?, cards_red = ?, fouls_drawn = ?, fouls_committed = ?,
             penalty_scored = ?, penalty_missed = ?, penalty_saved = ?
         WHERE stat_id = ?`
      : `INSERT INTO player_season_stats (
             player_id, team_id, league_id, season_year, appearences, lineups, minutes,
             goals_total, goals_assists, goals_conceded, shots_total, shots_on,
             passes_total, passes_key, passes_accuracy, dribbles_attempts, dribbles_success,
             duels_total, duels_won, cards_yellow, cards_red, fouls_drawn, fouls_committed,
             penalty_scored, penalty_missed, penalty_saved
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = statId
      ? [
          playerId,
          teamId,
          leagueId,
          seasonYear,
          appearences,
          lineups,
          minutes,
          goalsTotal,
          goalsAssists,
          goalsConceded,
          shotsTotal,
          shotsOn,
          passesTotal,
          passesKey,
          passesAccuracy,
          dribblesAttempts,
          dribblesSuccess,
          duelsTotal,
          duelsWon,
          cardsYellow,
          cardsRed,
          foulsDrawn,
          foulsCommitted,
          penaltyScored,
          penaltyMissed,
          penaltySaved,
          statId
        ]
      : [
          playerId,
          teamId,
          leagueId,
          seasonYear,
          appearences,
          lineups,
          minutes,
          goalsTotal,
          goalsAssists,
          goalsConceded,
          shotsTotal,
          shotsOn,
          passesTotal,
          passesKey,
          passesAccuracy,
          dribblesAttempts,
          dribblesSuccess,
          duelsTotal,
          duelsWon,
          cardsYellow,
          cardsRed,
          foulsDrawn,
          foulsCommitted,
          penaltyScored,
          penaltyMissed,
          penaltySaved
        ];

    const [result] = await db.query(sql, params);

    if (statId && !result.affectedRows) {
      return res.status(404).json({ error: 'Player season stats not found' });
    }

    res.status(statId ? 200 : 201).json({ message: 'Player season stats saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save player season stats', details: error.message });
  }
};

const deletePlayerSeasonStats = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM player_season_stats WHERE stat_id = ?',
      [req.params.statId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Player season stats not found' });
    }

    res.json({ message: 'Player season stats removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player season stats', details: error.message });
  }
};

module.exports = {
  listPlayerSeasonStats,
  getPlayerSeasonStatsById,
  upsertPlayerSeasonStats,
  deletePlayerSeasonStats
};
