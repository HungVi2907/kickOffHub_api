import { Op } from 'sequelize';
import Team from '../models/team.model.js';

const TEAM_ATTRIBUTES = ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'];

export function paginateTeams({ page, limit, popularOnly = false }) {
  const offset = (page - 1) * limit;
  const where = popularOnly ? { isPopular: true } : undefined;

  return Team.findAndCountAll({
    where,
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
    limit,
    offset,
  });
}

export function findTeamById(id) {
  return Team.findByPk(id, { attributes: TEAM_ATTRIBUTES });
}

export function findTeamsByIds(ids = []) {
  if (!ids.length) {
    return [];
  }
  return Team.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
  });
}

export function searchTeamsByName(keyword, limit) {
  return Team.findAll({
    where: {
      name: {
        [Op.like]: `%${keyword}%`,
      },
    },
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
    limit,
  });
}

export function createTeamRecord(payload) {
  return Team.create(payload);
}

export function updateTeamRecord(id, payload) {
  return Team.update(payload, { where: { id } });
}

export function deleteTeamRecord(id) {
  return Team.destroy({ where: { id } });
}

export function bulkUpsertTeams(teamPayloads) {
  return Team.bulkCreate(teamPayloads, {
    updateOnDuplicate: ['name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'],
  });
}
