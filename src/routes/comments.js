import express from 'express';
import { body, param } from 'express-validator';
import auth from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import commentRateLimiter from '../middlewares/commentRateLimiter.js';
import CommentsController from '../controllers/commentsController.js';

const router = express.Router();

router.use(auth);

router.post(
  '/posts/:postId/comments',
  [
    param('postId').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    body('content')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Nội dung bình luận phải từ 5 đến 500 ký tự')
  ],
  validateRequest,
  commentRateLimiter,
  CommentsController.create
);

router.delete(
  '/posts/:postId/comments/:commentId',
  [
    param('postId').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    param('commentId').isInt({ gt: 0 }).withMessage('ID bình luận phải là số nguyên dương')
  ],
  validateRequest,
  CommentsController.remove
);

export default router;
