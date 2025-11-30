import {
  deleteSeason,
  findOrCreateSeason,
  listSeasonsOrdered,
} from '../repositories/seasons.repository.js';

function parseSeasonValue(raw) {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    const error = new Error('SEASON_VALUE_INVALID');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

export async function listSeasons() {
  return listSeasonsOrdered();
}

export async function createSeasonEntry(payload = {}) {
  const seasonValue = parseSeasonValue(payload.season);
  const [season, created] = await findOrCreateSeason(seasonValue);
  return { season, created };
}

export async function removeSeason(rawSeason) {
  const seasonValue = parseSeasonValue(rawSeason);
  const deletedRows = await deleteSeason(seasonValue);
  if (!deletedRows) {
    const error = new Error('SEASON_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return true;
}
