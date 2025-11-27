import express from 'express';
import { body, param } from 'express-validator';
import auth from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import PostsController from '../controllers/postsController.js';
import { handlePostImageUpload } from '../middlewares/upload.js';
import { parseJsonFields } from '../middlewares/normalizeFormData.js';

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
  handlePostImageUpload,
  parseJsonFields(['tags']),
  [
    body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
    body('content').trim().notEmpty().withMessage('Nội dung không được để trống'),
    body('status').optional().isIn(['public', 'draft']).withMessage('Trạng thái không hợp lệ'),
    body('tags')
      .optional()
      .isArray({ min: 1, max: 10 })
      .withMessage('Tags phải là mảng từ 1 đến 10 phần tử'),
    body('tags.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Mỗi tag phải có từ 2 đến 30 ký tự')
  ],
  validateRequest,
  PostsController.create
);

router.put(
  '/posts/:id',
  handlePostImageUpload,
  parseJsonFields(['tags']),
  [
    param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    body('title').optional().trim().notEmpty().withMessage('Tiêu đề không được để trống'),
    body('content').optional().trim().notEmpty().withMessage('Nội dung không được để trống'),
    body('status').optional().isIn(['public', 'draft']).withMessage('Trạng thái không hợp lệ'),
    body('tags')
      .optional()
      .isArray({ min: 0, max: 10 })
      .withMessage('Tags phải là mảng tối đa 10 phần tử'),
    body('tags.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Mỗi tag phải có từ 2 đến 30 ký tự'),
    body('removeImage')
      .optional()
      .isBoolean()
      .withMessage('removeImage phải là giá trị true/false')
      .toBoolean()
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

router.post(
  '/posts/:id/like',
  [param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương')],
  validateRequest,
  PostsController.toggleLike
);

router.post(
  '/posts/:id/report',
  [
    param('id').isInt({ gt: 0 }).withMessage('ID bài viết phải là số nguyên dương'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Lý do báo cáo phải từ 5 đến 500 ký tự nếu cung cấp')
  ],
  validateRequest,
  PostsController.report
);

export default router;
