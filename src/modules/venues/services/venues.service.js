import { apiFootballGet } from '../../apiFootball/services/apiFootball.service.js';
import {
  findAllVenues,
  findVenueById,
  createVenueRecord,
  updateVenueRecord,
  deleteVenueRecord,
  bulkUpsertVenues,
} from '../repositories/venues.repository.js';

const ERROR_MESSAGES = {
  INVALID_VENUE_ID: 'ID venue không hợp lệ',
  VENUE_NOT_FOUND: 'Venue không tồn tại',
  MISSING_ID: 'id là bắt buộc',
  INVALID_ID: 'id phải là số nguyên dương hợp lệ',
};

function createError(code, status = 400, details) {
  const error = new Error(ERROR_MESSAGES[code] || code);
  error.code = code;
  error.status = status;
  if (details) {
    error.details = details;
  }
  return error;
}

function parsePositiveIntOrNull(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function requirePositiveInt(value, missingCode, invalidCode) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw createError(missingCode, 400);
  }
  const parsed = parsePositiveIntOrNull(value);
  if (parsed === null) {
    throw createError(invalidCode, 400);
  }
  return parsed;
}

function normalizeStringField(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function parseApiInteger(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function buildVenuePayloadFromApi(venue) {
  if (!venue) {
    return null;
  }
  const venueId = parseApiInteger(venue.id);
  if (!venueId) {
    return null;
  }
  const payload = {
    id: venueId,
    name: normalizeStringField(venue.name),
    address: normalizeStringField(venue.address),
    city: normalizeStringField(venue.city),
    capacity: parseApiInteger(venue.capacity),
    surface: normalizeStringField(venue.surface),
    image: normalizeStringField(venue.image),
  };
  if (!payload.name) {
    return null;
  }
  return payload;
}

export async function listVenues() {
  return findAllVenues();
}

export async function getVenueById(rawId) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const venue = await findVenueById(venueId);
  if (!venue) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
  return venue;
}

export async function createVenue(payload) {
  return createVenueRecord(payload);
}

export async function updateVenue(rawId, payload) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const [updatedRows] = await updateVenueRecord(venueId, payload);
  if (updatedRows === 0) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
  return findVenueById(venueId);
}

export async function deleteVenue(rawId) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const deletedRows = await deleteVenueRecord(venueId);
  if (deletedRows === 0) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
}

export async function importVenuesFromApi(params = {}) {
  const idValue = requirePositiveInt(params.id, 'MISSING_ID', 'INVALID_ID');
  const data = await apiFootballGet('/venues', { id: idValue });
  const apiVenues = Array.isArray(data?.response) ? data.response : [];

  if (apiVenues.length === 0) {
    return {
      imported: 0,
      message: 'Không có venue nào được trả về từ API-Football',
    };
  }

  const venuePayloads = apiVenues
    .map((venue) => buildVenuePayloadFromApi(venue))
    .filter((entry) => entry !== null);

  if (venuePayloads.length === 0) {
    return {
      imported: 0,
      message: 'Không có venue hợp lệ để lưu',
    };
  }

  await bulkUpsertVenues(venuePayloads);

  return {
    imported: venuePayloads.length,
    id: idValue,
  };
}
