/**
 * @file Player-Team-League-Season Model
 * @description Sequelize model for the player-team-league-season junction table.
 *              Represents the many-to-many relationship between players, teams, leagues, and seasons.
 * @module modules/playerTeamLeagueSeason/models/playerTeamLeagueSeason
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import Player from '../../players/models/player.model.js';

/**
 * Player-Team-League-Season junction model.
 * Represents which players are associated with which teams in specific leagues during seasons.
 *
 * @typedef {Object} PlayerTeamLeagueSeasonAttributes
 * @property {number} playerId - The player identifier (composite primary key)
 * @property {number} leagueId - The league identifier (composite primary key)
 * @property {number} teamId - The team identifier (composite primary key)
 * @property {number} season - The season year (composite primary key)
 */

/**
 * Sequelize model definition for PlayerTeamLeagueSeason.
 * Uses a composite primary key of (playerId, leagueId, teamId, season).
 *
 * @type {import('sequelize').Model}
 */
const PlayerTeamLeagueSeason = sequelize.define('PlayerTeamLeagueSeason', {
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'player_id',
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'league_id',
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'team_id',
  },
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'players_teams_league_season',
  timestamps: false,
  underscored: true,
});

PlayerTeamLeagueSeason.belongsTo(Player, {
  foreignKey: 'playerId',
  as: 'player',
});

export default PlayerTeamLeagueSeason;
