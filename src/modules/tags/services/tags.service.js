/**
 * @file Tags Service
 * @description Business logic layer for tag operations. Handles tag retrieval
 * with optional filtering and post count aggregation.
 * @module modules/tags/services/tags
 */

import { findTagsWithPostCounts } from '../repositories/tags.repository.js';

/**
 * Retrieves all tags with their associated post counts.
 * @async
 * @function listTags
 * @param {string} [searchTerm] - Optional search term to filter tags by name
 * @returns {Promise<Array<Object>>} Array of tag objects with post counts
 * @returns {number} returns[].id - Tag ID
 * @returns {string} returns[].slug - Tag slug/name
 * @returns {string} returns[].label - Tag display label
 * @returns {number} returns[].postCount - Number of posts using this tag
 */
export async function listTags(searchTerm) {
  return findTagsWithPostCounts(searchTerm);
}
