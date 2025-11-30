import Comment from '../models/comment.model.js';
import Post from '../../posts/models/post.model.js';
import User from '../../users/models/user.model.js';

export function findPostById(id) {
  return Post.findByPk(id, {
    attributes: ['id', 'title', 'user_id'],
  });
}

export function createCommentRecord(data) {
  return Comment.create(data);
}

export function findCommentByIdentity({ commentId, postId }) {
  return Comment.findOne({
    where: { id: commentId, post_id: postId },
  });
}

export function findCommentWithAuthor(id) {
  return Comment.findByPk(id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
  });
}

export function deleteCommentRecord(commentInstance) {
  if (!commentInstance) {
    return null;
  }
  return commentInstance.destroy();
}
