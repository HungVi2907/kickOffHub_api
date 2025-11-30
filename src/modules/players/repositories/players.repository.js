import { Op } from 'sequelize';
import sequelize from '../../../common/db.js';
import Player from '../models/player.model.js';

export function findAndCountPlayers(options = {}) {
  return Player.findAndCountAll(options);
}

export function findPlayers(options = {}) {
  return Player.findAll(options);
}

export function findPlayerById(id, options = {}) {
  return Player.findByPk(id, options);
}

export function createPlayer(payload) {
  return Player.create(payload);
}

export function updatePlayer(id, payload) {
  return Player.update(payload, { where: { id } });
}

export function deletePlayer(id) {
  return Player.destroy({ where: { id } });
}

export function bulkUpsertPlayers(payloads) {
  return Player.bulkCreate(payloads, {
    updateOnDuplicate: [
      'name',
      'firstname',
      'lastname',
      'age',
      'birth_date',
      'birth_place',
      'birth_country',
      'nationality',
      'height',
      'weight',
      'number',
      'position',
      'photo',
    ],
  });
}

export function buildNameSearchCondition(keywordLower) {
  const escaped = keywordLower.replace(/[%_]/g, '\\$&');
  const likePattern = `%${escaped}%`;
  return {
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          { [Op.like]: likePattern },
        ),
      ],
    },
  };
}
