import { Op } from 'sequelize';
import Team from '../../teams/models/team.model.js';
import {
  deleteMapping,
  findMappings,
  findTeamIdsByLeagueAndSeason,
} from '../repositories/leagueTeamSeason.repository.js';

const TEAM_ATTRIBUTES = ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'];
const LTS_ATTRIBUTES = ['leagueId', 'teamId', 'season', 'created_at', 'updated_at'];

export class LeagueTeamSeasonValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parsePositiveInt(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new LeagueTeamSeasonValidationError(`${fieldName} is not a valid positive integer`);
  }
  return parsed;
}

function parseOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return undefined;
  }
  return parsePositiveInt(trimmed, fieldName);
}

function buildFilter(query = {}) {
  const filter = {};
  const leagueId = parseOptionalPositiveInt(query.leagueId, 'leagueId');
  const teamId = parseOptionalPositiveInt(query.teamId, 'teamId');
  const season = parseOptionalPositiveInt(query.season, 'season');

  if (leagueId !== undefined) {
    filter.leagueId = leagueId;
  }
  if (teamId !== undefined) {
    filter.teamId = teamId;
  }
  if (season !== undefined) {
    filter.season = season;
  }
  return filter;
}

export async function listMappings(query = {}) {
  const filter = buildFilter(query);
  return findMappings(filter, {
    attributes: LTS_ATTRIBUTES,
    order: [
      ['leagueId', 'ASC'],
      ['season', 'DESC'],
      ['teamId', 'ASC'],
    ],
  });
}

export async function listTeamsForLeagueSeason(rawLeagueId, rawSeason) {
  const leagueId = parsePositiveInt(rawLeagueId, 'leagueId');
  const season = parsePositiveInt(rawSeason, 'season');
  const records = await findTeamIdsByLeagueAndSeason(leagueId, season);

  if (!records.length) {
    return [];
  }

  const teamIds = [...new Set(records.map((record) => record.teamId))];
  if (!teamIds.length) {
    return [];
  }

  return Team.findAll({
    where: { id: { [Op.in]: teamIds } },
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
  });
}

export async function removeMapping(rawLeagueId, rawTeamId, rawSeason) {
  const leagueId = parsePositiveInt(rawLeagueId, 'leagueId');
  const teamId = parsePositiveInt(rawTeamId, 'teamId');
  const season = parsePositiveInt(rawSeason, 'season');

  const deletedRows = await deleteMapping({ leagueId, teamId, season });
  if (!deletedRows) {
    throw new LeagueTeamSeasonValidationError('Record does not exist', 404);
  }
  return true;
}
