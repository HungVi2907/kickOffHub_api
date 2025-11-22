import express from 'express';
import { body, param } from 'express-validator';
import auth from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import PostsController from '../controllers/postsController.js';

const router = express.Router();

router.use(auth);

router.get('/posts', PostsController.list);

router.get(
  '/posts/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương')],
  validateRequest,
  PostsController.detail
);

router.post(
  '/posts',
  [
    body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
    body('content').trim().notEmpty().withMessage('Nội dung không được để trống'),
    body('status').optional().isIn(['public', 'draft']).withMessage('Trạng thái không hợp lệ')
  ],
  validateRequest,
  PostsController.create
);

router.put(
  '/posts/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    body('title').optional().trim().notEmpty().withMessage('Tiêu đề không được để trống'),
    body('content').optional().trim().notEmpty().withMessage('Nội dung không được để trống'),
    body('status').optional().isIn(['public', 'draft']).withMessage('Trạng thái không hợp lệ')
  ],
  validateRequest,
  PostsController.update
);

router.delete(
  '/posts/:id',
  [param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương')],
  validateRequest,
  PostsController.remove
);

export default router;
