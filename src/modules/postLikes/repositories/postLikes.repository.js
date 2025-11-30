import PostLike from '../models/postLike.model.js';

export function findLikeByUser(postId, userId) {
  return PostLike.findOne({ where: { post_id: postId, user_id: userId } });
}

export function createLike(postId, userId) {
  return PostLike.create({ post_id: postId, user_id: userId });
}

export async function deleteLike(postLikeInstance) {
  await postLikeInstance.destroy();
}

export function countLikes(postId) {
  return PostLike.count({ where: { post_id: postId } });
}
