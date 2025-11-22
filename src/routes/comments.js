import express from 'express';
import { body, param } from 'express-validator';
import auth from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import CommentsController from '../controllers/commentsController.js';

const router = express.Router();

router.use(auth);

router.post(
  '/posts/:postId/comments',
  [
    param('postId').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    body('content').trim().notEmpty().withMessage('Nội dung bình luận không được để trống')
  ],
  validateRequest,
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
