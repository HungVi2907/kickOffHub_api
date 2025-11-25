import { Op } from 'sequelize';
import LeagueTeamSeason from '../models/LeagueTeamSeason.js';
import Team from '../models/Team.js';

const TEAM_ATTRIBUTES = ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'];
const LTS_ATTRIBUTES = ['leagueId', 'teamId', 'season', 'created_at', 'updated_at'];

const createValidationError = (message) => {
  const error = new Error(message);
  error.isValidationError = true;
  return error;
};

const parsePositiveInt = (value, fieldName) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createValidationError(`${fieldName} is not a valid positive integer`);
  }
  return parsed;
};

const parseOptionalPositiveInt = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }
  const stringValue = String(value).trim();
  if (stringValue === '') {
    return undefined;
  }
  return parsePositiveInt(stringValue, fieldName);
};

const buildFilter = (query) => {
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
};

class LeagueTeamSeasonController {
  static async getAll(req, res) {
    try {
      const filter = buildFilter(req.query);
      const records = await LeagueTeamSeason.findAll({
        where: filter,
        attributes: LTS_ATTRIBUTES,
        order: [
          ['leagueId', 'ASC'],
          ['season', 'DESC'],
          ['teamId', 'ASC']
        ]
      });
      res.json(records);
    } catch (error) {
      if (error.isValidationError) {
        return res.status(400).json({ error: 'Invalid query parameters' });
      }
      res.status(500).json({ error: 'Error retrieving league team season records' });
    }
  }

  static async getByLeagueAndSeason(req, res) {
    try {
      const leagueId = parsePositiveInt(req.params.leagueId, 'leagueId');
      const season = parsePositiveInt(req.params.season, 'season');

      const records = await LeagueTeamSeason.findAll({
        where: { leagueId, season },
        attributes: ['teamId']
      });

      if (records.length === 0) {
        return res.json([]);
      }

      const teamIds = [...new Set(records.map((record) => record.teamId))];
      if (teamIds.length === 0) {
        return res.json([]);
      }

      const teams = await Team.findAll({
        where: { id: { [Op.in]: teamIds } },
        attributes: TEAM_ATTRIBUTES,
        order: [['name', 'ASC']]
      });
      return res.json(teams);
    } catch (error) {
      if (error.isValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error retrieving data by leagueId and season' });
    }
  }

  static async deleteEntry(req, res) {
    try {
      const leagueId = parsePositiveInt(req.params.leagueId, 'leagueId');
      const teamId = parsePositiveInt(req.params.teamId, 'teamId');
      const season = parsePositiveInt(req.params.season, 'season');

      const deletedRows = await LeagueTeamSeason.destroy({
        where: { leagueId, teamId, season }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Record does not exist' });
      }

      res.json({ message: 'Record has been successfully deleted' });
    } catch (error) {
      if (error.isValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error deleting record' });
    }
  }
}

export default LeagueTeamSeasonController;
