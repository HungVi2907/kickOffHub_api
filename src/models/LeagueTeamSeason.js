import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Sequelize model for the leagues_teams_season pivot table
const LeagueTeamSeason = sequelize.define('LeagueTeamSeason', {
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'league_id'
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'team_id'
  },
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  tableName: 'leagues_teams_season',
  timestamps: false
});

export default LeagueTeamSeason;
