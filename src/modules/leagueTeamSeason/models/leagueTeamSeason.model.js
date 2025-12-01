/**
 * @file League-Team-Season Model
 * @description Sequelize model for the league-team-season junction table.
 *              Represents the many-to-many relationship between leagues, teams, and seasons.
 * @module modules/leagueTeamSeason/models/leagueTeamSeason
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * League-Team-Season junction model.
 * Represents which teams participate in which leagues during specific seasons.
 *
 * @typedef {Object} LeagueTeamSeasonAttributes
 * @property {number} leagueId - The league identifier (composite primary key)
 * @property {number} teamId - The team identifier (composite primary key)
 * @property {number} season - The season year (composite primary key)
 */

/**
 * Sequelize model definition for LeagueTeamSeason.
 * Uses a composite primary key of (leagueId, teamId, season).
 *
 * @type {import('sequelize').Model}
 */
const LeagueTeamSeason = sequelize.define('LeagueTeamSeason', {
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
  tableName: 'leagues_teams_season',
  timestamps: false,
});

export default LeagueTeamSeason;
