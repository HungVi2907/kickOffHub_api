import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Player from './Player.js';

// Pivot model ánh xạ bảng players_teams_league_season
const PlayerTeamLeagueSeason = sequelize.define('PlayerTeamLeagueSeason', {
	playerId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		field: 'player_id'
	},
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
	tableName: 'players_teams_league_season',
	timestamps: false,
	underscored: true
});

PlayerTeamLeagueSeason.belongsTo(Player, {
	foreignKey: 'playerId',
	as: 'player'
});

export default PlayerTeamLeagueSeason;
