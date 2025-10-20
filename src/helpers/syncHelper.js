const DEFAULT_BATCH_SIZE = 2;
const MIN_BATCH_SIZE = 1;
const MAX_BATCH_SIZE = 2;

/**
 * Splits an array into batches of a given size.
 * @param {Array} items - Items to split.
 * @param {number} [size=DEFAULT_BATCH_SIZE] - Desired batch size.
 * @returns {Array<Array>} Batches of items.
 */
function chunkItems(items, size = DEFAULT_BATCH_SIZE) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  const normalizedSize = normalizeBatchSize(size);
  const batches = [];

  for (let index = 0; index < items.length; index += normalizedSize) {
    batches.push(items.slice(index, index + normalizedSize));
  }

  return batches;
}

/**
 * Normalizes and clamps the batch size within the supported range.
 * @param {number} candidateSize - Requested batch size.
 * @returns {number} - Safe batch size.
 */
function normalizeBatchSize(candidateSize) {
  const parsed = Number(candidateSize);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_BATCH_SIZE;
  }

  if (parsed < MIN_BATCH_SIZE) {
    return MIN_BATCH_SIZE;
  }

  if (parsed > MAX_BATCH_SIZE) {
    return MAX_BATCH_SIZE;
  }

  return Math.floor(parsed);
}

/**
 * Trims and uppercases a country code, returning null when it is not usable.
 * @param {string} code - Raw country code from the database.
 * @returns {string|null} - Sanitized country code or null when invalid.
 */
function sanitizeCountryCode(code) {
  if (typeof code !== 'string') {
    return null;
  }

  const trimmed = code.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}

/**
 * Trims and normalizes a country name, returning null when it is not usable.
 * @param {string} name - Raw country name from the database.
 * @returns {string|null} - Sanitized country name or null when invalid.
 */
function sanitizeCountryName(name) {
  if (typeof name !== 'string') {
    return null;
  }

  const trimmed = name.trim();
  return trimmed || null;
}


module.exports = {
  chunkItems,
  normalizeBatchSize,
  sanitizeCountryCode,
  sanitizeCountryName,
  constants: {
    DEFAULT_BATCH_SIZE,
    MIN_BATCH_SIZE,
    MAX_BATCH_SIZE
  }
};
