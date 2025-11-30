import LeagueTeamSeason from '../models/leagueTeamSeason.model.js';

export function findMappings(filter = {}, options = {}) {
  return LeagueTeamSeason.findAll({ where: filter, ...options });
}

export function findTeamIdsByLeagueAndSeason(leagueId, season) {
  return LeagueTeamSeason.findAll({
    where: { leagueId, season },
    attributes: ['teamId'],
  });
}

export function deleteMapping(where) {
  return LeagueTeamSeason.destroy({ where });
}
