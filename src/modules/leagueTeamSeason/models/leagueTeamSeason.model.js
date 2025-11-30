import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

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
