import LeagueTeamSeason from '../../leagueTeamSeason/models/leagueTeamSeason.model.js';

export function findMappingsByLeagueAndSeason(leagueId, season) {
  const where = { leagueId };
  if (season !== undefined) {
    where.season = season;
  }
  return LeagueTeamSeason.findAll({
    where,
    attributes: ['teamId', 'leagueId', 'season'],
  });
}

export function upsertLeagueTeamSeason(payload) {
  return LeagueTeamSeason.upsert(payload);
}
