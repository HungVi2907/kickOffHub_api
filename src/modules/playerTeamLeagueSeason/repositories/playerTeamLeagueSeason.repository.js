import PlayerTeamLeagueSeason from '../models/playerTeamLeagueSeason.model.js';
import Player from '../../players/models/player.model.js';

export function upsertMapping(payload) {
  return PlayerTeamLeagueSeason.upsert(payload);
}

export function findMappingByIdentifiers(identifiers) {
  return PlayerTeamLeagueSeason.findOne({ where: identifiers });
}

export function deleteMappingByIdentifiers(identifiers) {
  return PlayerTeamLeagueSeason.destroy({ where: identifiers });
}

export function findMappingsWithPlayers(filters, playerAttributes) {
  return PlayerTeamLeagueSeason.findAll({
    where: filters,
    attributes: ['playerId', 'leagueId', 'teamId', 'season'],
    include: [{
      model: Player,
      as: 'player',
      attributes: playerAttributes,
      required: true,
    }],
    order: [[{ model: Player, as: 'player' }, 'name', 'ASC']],
  });
}
