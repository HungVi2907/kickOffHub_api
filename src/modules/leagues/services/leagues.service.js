import {
  createLeagueRecord,
  deleteLeagueById,
  findAllLeagues,
  findLeagueById,
  searchLeaguesByKeyword,
  updateLeagueRecord,
} from '../repositories/leagues.repository.js';

const LEAGUE_ATTRIBUTES = ['id', 'name', 'type', 'logo'];
const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 100;

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeLeagueId(rawId) {
  const id = parsePositiveInt(rawId);
  if (!id) {
    const error = new Error('LEAGUE_ID_INVALID');
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function validateName(name) {
  if (name === undefined) {
    return undefined;
  }
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    const error = new Error('LEAGUE_NAME_REQUIRED');
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

export async function listLeagues() {
  return findAllLeagues(LEAGUE_ATTRIBUTES);
}

export async function fetchLeagueById(rawId) {
  const id = normalizeLeagueId(rawId);
  const league = await findLeagueById(id, LEAGUE_ATTRIBUTES);
  if (!league) {
    const error = new Error('LEAGUE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return league;
}

export async function createLeague(payload) {
  const id = normalizeLeagueId(payload?.id);
  const name = validateName(payload?.name);
  const league = await createLeagueRecord({
    id,
    name,
    type: payload?.type,
    logo: payload?.logo,
  });
  return findLeagueById(league.id, LEAGUE_ATTRIBUTES);
}

export async function updateLeague(rawId, payload = {}) {
  const id = normalizeLeagueId(rawId);
  const updates = {};

  if (payload.name !== undefined) {
    updates.name = validateName(payload.name);
  }
  if (payload.type !== undefined) {
    updates.type = payload.type;
  }
  if (payload.logo !== undefined) {
    updates.logo = payload.logo;
  }

  if (!Object.keys(updates).length) {
    const error = new Error('LEAGUE_UPDATE_EMPTY');
    error.statusCode = 400;
    throw error;
  }

  const [affected] = await updateLeagueRecord(id, updates);
  if (!affected) {
    const notFound = new Error('LEAGUE_NOT_FOUND');
    notFound.statusCode = 404;
    throw notFound;
  }

  return findLeagueById(id, LEAGUE_ATTRIBUTES);
}

export async function removeLeague(rawId) {
  const id = normalizeLeagueId(rawId);
  const deleted = await deleteLeagueById(id);
  if (!deleted) {
    const error = new Error('LEAGUE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return true;
}

export async function searchLeagues(keywordRaw, { limit: limitRaw, page: pageRaw } = {}) {
  const keyword = typeof keywordRaw === 'string' ? keywordRaw.trim() : '';
  if (!keyword) {
    const error = new Error('LEAGUE_KEYWORD_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  let limit = parsePositiveInt(limitRaw ?? DEFAULT_SEARCH_LIMIT) ?? DEFAULT_SEARCH_LIMIT;
  if (limit > MAX_SEARCH_LIMIT) {
    const error = new Error('LEAGUE_LIMIT_TOO_LARGE');
    error.statusCode = 400;
    throw error;
  }

  let page = parsePositiveInt(pageRaw ?? 1);
  if (!page) {
    const error = new Error('LEAGUE_PAGE_INVALID');
    error.statusCode = 400;
    throw error;
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await searchLeaguesByKeyword(keyword.toLowerCase(), {
    limit,
    offset,
    attributes: LEAGUE_ATTRIBUTES,
  });

  return {
    results: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      page,
      limit,
    },
    keyword,
  };
}
