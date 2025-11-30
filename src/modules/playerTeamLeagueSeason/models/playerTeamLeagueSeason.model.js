import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import Player from '../../players/models/player.model.js';

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
