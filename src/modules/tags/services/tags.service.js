import { findTagsWithPostCounts } from '../repositories/tags.repository.js';

export async function listTags(searchTerm) {
  return findTagsWithPostCounts(searchTerm);
}
