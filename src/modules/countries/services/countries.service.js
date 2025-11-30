import { Op, fn, col, where } from 'sequelize';
import Country from '../models/country.model.js';

export const COUNTRY_ATTRIBUTES = ['id', 'name', 'code', 'flag'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class CountryInputError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'CountryInputError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const createInputError = (code, message, statusCode = 400) =>
  new CountryInputError(code, message, statusCode);

export function parsePositiveIntOrDefault(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return defaultValue;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function listCountries({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
  const pageNumber = parsePositiveIntOrDefault(page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createInputError('INVALID_PAGE', 'Page value must be a positive integer');
  }

  const limitNumber = parsePositiveIntOrDefault(limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createInputError('INVALID_LIMIT', 'Limit value must be a positive integer');
  }
  if (limitNumber > MAX_LIMIT) {
    throw createInputError('LIMIT_TOO_LARGE', `Limit cannot exceed ${MAX_LIMIT}`);
  }

  const offset = (pageNumber - 1) * limitNumber;

  const { rows, count } = await Country.findAndCountAll({
    attributes: COUNTRY_ATTRIBUTES,
    order: [['name', 'ASC']],
    limit: limitNumber,
    offset,
  });
  const totalPages = Math.ceil(count / limitNumber);
  if (totalPages !== 0 && pageNumber > totalPages) {
    throw createInputError('PAGE_OUT_OF_RANGE', 'Page exceeds total pages');
  }

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
}

export async function searchCountriesByName({ name, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE } = {}) {
  const keywordRaw = typeof name === 'string' ? name.trim() : '';
  if (!keywordRaw) {
    throw createInputError('NAME_REQUIRED', 'Country name is required');
  }

  const limitNumber = parsePositiveIntOrDefault(limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createInputError('INVALID_LIMIT', 'limit must be a positive integer');
  }

  const pageNumber = parsePositiveIntOrDefault(page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createInputError('INVALID_PAGE', 'page must be a positive integer');
  }

  const offset = (pageNumber - 1) * limitNumber;
  const keywordLower = keywordRaw.toLowerCase();
  const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
  const likePattern = `%${escapedKeyword}%`;

  const { rows: countries, count: totalItems } = await Country.findAndCountAll({
    attributes: COUNTRY_ATTRIBUTES,
    where: where(fn('LOWER', col('name')), { [Op.like]: likePattern }),
    order: [['name', 'ASC']],
    limit: limitNumber,
    offset,
    escape: '\\',
  });

  const totalPages = Math.ceil(totalItems / limitNumber);

  return {
    results: countries,
    pagination: {
      totalItems,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
    },
    keyword: keywordRaw,
  };
}

export async function getCountryById(id) {
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  const country = await Country.findByPk(countryId, { attributes: COUNTRY_ATTRIBUTES });
  if (!country) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  return country;
}

export async function createCountry(payload = {}) {
  const { name, code, flag } = payload;
  if (!name) {
    throw createInputError('NAME_REQUIRED', 'Name is required');
  }
  const country = await Country.create({ name, code, flag });
  return country;
}

export async function updateCountry(id, payload = {}) {
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  const { name, code, flag } = payload;
  if (!name) {
    throw createInputError('NAME_REQUIRED', 'Name is required');
  }

  const [updated] = await Country.update(
    { name, code, flag },
    { where: { id: countryId } },
  );
  if (updated === 0) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  return Country.findByPk(countryId, { attributes: COUNTRY_ATTRIBUTES });
}

export async function deleteCountry(id) {
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  const deleted = await Country.destroy({ where: { id: countryId } });
  if (deleted === 0) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  return true;
}
