import {
  deleteMappingByIdentifiers,
  findMappingByIdentifiers,
  findMappingsWithPlayers,
  upsertMapping,
} from '../repositories/playerTeamLeagueSeason.repository.js';

const PLAYER_ATTRIBUTES = [
  'id',
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
];

export class PlayerTeamLeagueSeasonServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parsePositiveInt(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new PlayerTeamLeagueSeasonServiceError(`Thiếu thông tin bắt buộc: ${fieldName}`);
    }
    return undefined;
  }
  const parsed = Number.parseInt(String(value).trim(), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PlayerTeamLeagueSeasonServiceError(`Trường ${fieldName} phải là số nguyên dương hợp lệ`);
  }
  return parsed;
}

function buildPayload(body = {}, { allowPartial = false } = {}) {
  const payload = {};
  for (const field of ['playerId', 'leagueId', 'teamId', 'season']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const parsed = parsePositiveInt(body[field], field, { required: !allowPartial });
      if (parsed !== undefined) {
        payload[field] = parsed;
      }
    }
  }

  if (!allowPartial) {
    for (const field of ['playerId', 'leagueId', 'teamId', 'season']) {
      if (!Object.prototype.hasOwnProperty.call(payload, field)) {
        throw new PlayerTeamLeagueSeasonServiceError(`Thiếu thông tin bắt buộc: ${field}`);
      }
    }
  }

  return payload;
}

function normalizeIdentifiers(raw = {}) {
  return {
    playerId: parsePositiveInt(raw.playerId, 'playerId', { required: true }),
    leagueId: parsePositiveInt(raw.leagueId, 'leagueId', { required: true }),
    teamId: parsePositiveInt(raw.teamId, 'teamId', { required: true }),
    season: parsePositiveInt(raw.season, 'season', { required: true }),
  };
}

function handleSequelizeError(error, conflictMessage) {
  if (error?.name === 'SequelizeForeignKeyConstraintError') {
    throw new PlayerTeamLeagueSeasonServiceError(
      'playerId hoặc teamId hoặc leagueId không tồn tại trong hệ thống',
      409,
    );
  }
  if (error?.name === 'SequelizeUniqueConstraintError') {
    throw new PlayerTeamLeagueSeasonServiceError(conflictMessage ?? 'Bản ghi với thông tin mới đã tồn tại', 409);
  }
  throw error;
}

export async function createMapping(payload = {}) {
  const data = buildPayload(payload);
  try {
    await upsertMapping(data);
  } catch (error) {
    handleSequelizeError(error);
  }
  return data;
}

export async function createMappingRecord(payload = {}) {
  return createMapping(payload);
}

export async function updateMappingRecord(rawIdentifiers = {}, body = {}) {
  const identifiers = normalizeIdentifiers(rawIdentifiers);
  const updates = buildPayload(body, { allowPartial: true });
  if (!Object.keys(updates).length) {
    throw new PlayerTeamLeagueSeasonServiceError('Không có dữ liệu để cập nhật');
  }

  const mapping = await findMappingByIdentifiers(identifiers);
  if (!mapping) {
    throw new PlayerTeamLeagueSeasonServiceError('Không tìm thấy bản ghi để cập nhật', 404);
  }

  try {
    await mapping.update(updates);
  } catch (error) {
    handleSequelizeError(error);
  }

  await mapping.reload();
  return mapping;
}

export async function deleteMappingRecord(rawIdentifiers = {}) {
  const identifiers = normalizeIdentifiers(rawIdentifiers);
  const deleted = await deleteMappingByIdentifiers(identifiers);
  if (!deleted) {
    throw new PlayerTeamLeagueSeasonServiceError('Không tìm thấy bản ghi để xóa', 404);
  }
  return true;
}

export async function findPlayersByFilters(query = {}) {
  const filters = {
    leagueId: parsePositiveInt(query.leagueId, 'leagueId', { required: true }),
    teamId: parsePositiveInt(query.teamId, 'teamId', { required: true }),
    season: parsePositiveInt(query.season, 'season', { required: true }),
  };

  const mappings = await findMappingsWithPlayers(filters, PLAYER_ATTRIBUTES);
  return {
    filters,
    total: mappings.length,
    players: mappings.map((record) => ({
      playerId: record.playerId,
      leagueId: record.leagueId,
      teamId: record.teamId,
      season: record.season,
      player: record.player,
    })),
  };
}
