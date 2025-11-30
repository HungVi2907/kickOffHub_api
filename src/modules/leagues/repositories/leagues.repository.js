import { Op, col, fn, where } from 'sequelize';
import League from '../models/league.model.js';

export function findAllLeagues(attributes) {
  return League.findAll({ attributes });
}

export function findLeagueById(id, attributes) {
  return League.findByPk(id, { attributes });
}

export function createLeagueRecord(payload) {
  return League.create(payload);
}

export function updateLeagueRecord(id, payload) {
  return League.update(payload, { where: { id } });
}

export function deleteLeagueById(id) {
  return League.destroy({ where: { id } });
}

export function searchLeaguesByKeyword(keywordLower, { limit, offset, attributes }) {
  const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
  const likePattern = `%${escapedKeyword}%`;
  return League.findAndCountAll({
    attributes,
    where: where(fn('LOWER', col('name')), { [Op.like]: likePattern }),
    order: [['name', 'ASC']],
    limit,
    offset,
    escape: '\\',
  });
}
