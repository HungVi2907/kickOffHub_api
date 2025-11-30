import Season from '../models/season.model.js';

export function listSeasonsOrdered() {
  return Season.findAll({ order: [['season', 'DESC']] });
}

export function findOrCreateSeason(seasonValue) {
  return Season.findOrCreate({
    where: { season: seasonValue },
    defaults: { season: seasonValue },
  });
}

export function deleteSeason(seasonValue) {
  return Season.destroy({ where: { season: seasonValue } });
}
