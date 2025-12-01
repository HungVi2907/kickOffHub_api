/**
 * @fileoverview Posts Routes - Định nghĩa HTTP routes cho Posts API
 * 
 * File này định nghĩa tất cả routes cho Posts module, bao gồm:
 * - Public routes: Không yêu cầu authentication (list, detail)
 * - Private routes: Yêu cầu JWT authentication (create, update, delete)
 * 
 * Tất cả routes đều có OpenAPI/Swagger documentation để tự động generate API docs.
 * 
 * Routes:
 * - GET    /api/posts      - Lấy danh sách bài viết (public)
 * - GET    /api/posts/:id  - Lấy chi tiết bài viết (public)
 * - POST   /api/posts      - Tạo bài viết mới (private)
 * - PATCH  /api/posts/:id  - Cập nhật bài viết (private)
 * - DELETE /api/posts/:id  - Xóa bài viết (private)
 * 
 * @module modules/posts/routes/posts.routes
 * @requires express - Express framework
 * @requires ../../../common/authMiddleware.js - JWT authentication middleware
 * @requires ../../../common/uploadMiddleware.js - Multer image upload middleware
 * @requires ../../../middlewares/normalizeFormData.js - JSON field parser for multipart
 * @requires ../../../middlewares/validateSchema.js - Zod schema validation middleware
 * @requires ../controllers/posts.controller.js - Request handlers
 * @requires ../validation/posts.validation.js - Zod validation schemas
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import express from 'express';
import auth from '../../../common/authMiddleware.js';
import { handlePostImageUpload } from '../../../common/uploadMiddleware.js';
import { parseJsonFields } from '../../../middlewares/normalizeFormData.js';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import PostsController from '../controllers/posts.controller.js';
import {
  createPostSchema,
  postIdParamSchema,
  updatePostSchema,
} from '../validation/posts.validation.js';

/**
 * Router cho các endpoints công khai (không cần auth)
 * @type {express.Router}
 */
const publicRouter = express.Router();

/**
 * Router cho các endpoints yêu cầu authentication
 * @type {express.Router}
 */
const privateRouter = express.Router();

/**
 * Middleware logging để debug routes
 * Log method và URL của mỗi request
 * 
 * @function logPostRoute
 * @param {express.Request} req - Express request
 * @param {express.Response} _res - Express response (unused)
 * @param {express.NextFunction} next - Next middleware
 */
const logPostRoute = (req, _res, next) => {
  console.log('POST ROUTE HIT:', req.method, req.originalUrl);
  next();
};

// Áp dụng logging middleware cho cả 2 routers
publicRouter.use(logPostRoute);
privateRouter.use(logPostRoute);

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: List posts
 *     description: Returns paginated posts ordered by newest first. Supports optional `page` and `limit` query parameters.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Posts retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *             example:
 *               success: true
 *               message: "Posts retrieved"
 *               data:
 *                 total: 125
 *                 page: 1
 *                 pageSize: 10
 *                 data:
 *                   - id: 1
 *                     title: "Matchday recap"
 *                     image_url: "https://cdn.example/post-1.jpg"
 *       500:
 *         description: Unexpected error while listing posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *               data: null
 */
publicRouter.get('/posts', PostsController.list);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     summary: Get post detail
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Post retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Post retrieved"
 *               data:
 *                 id: 10
 *                 title: "Post title"
 *                 content: "..."
 *                 image_url: "https://cdn.example/post.jpg"
 *       400:
 *         description: Invalid post ID supplied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Post ID is invalid"
 *               data: null
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Post not found"
 *               data: null
 *       500:
 *         description: Unexpected error while retrieving the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *               data: null
 */
publicRouter.get('/posts/:id', validateSchema(postIdParamSchema), PostsController.detail);

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Create post
 *     description: Accepts multipart/form-data with optional image upload.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [public, draft]
 *               tags:
 *                 type: string
 *                 description: JSON encoded array produced by `parseJsonFields`.
 *               image:
 *                 type: string
 *                 format: binary
 *           example:
 *             title: "Matchday recap"
 *             content: "Long form content"
 *             status: "public"
 *             tags: "[\"premier-league\",\"analysis\"]"
 *     responses:
 *       201:
 *         description: Post created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Post created"
 *               data:
 *                 id: 201
 *                 title: "Matchday recap"
 *                 tags: ["premier-league","analysis"]
 *       400:
 *         description: Validation failed (missing title/content or invalid tags JSON).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               data: null
 *       401:
 *         description: Missing/invalid bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *               data: null
 *       500:
 *         description: Unexpected error while creating the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *               data: null
 */
privateRouter.post(
  '/posts',
  auth,
  handlePostImageUpload,
  parseJsonFields(['tags']),
  validateSchema(createPostSchema),
  PostsController.create,
);

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     summary: Update post
 *     description: Accepts multipart/form-data; payload may include `removeImage=true` to delete the current asset.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [public, draft]
 *               tags:
 *                 type: string
 *               removeImage:
 *                 type: string
 *                 description: Pass "true" to remove the existing image.
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Post updated"
 *               data:
 *                 id: 10
 *                 title: "Updated title"
 *       400:
 *         description: Validation failed (no fields supplied or invalid tags JSON).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               data: null
 *       401:
 *         description: Missing/invalid bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *               data: null
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Post not found"
 *               data: null
 *       500:
 *         description: Unexpected error while updating the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *               data: null
 */
privateRouter.put(
  '/posts/:id',
  auth,
  handlePostImageUpload,
  parseJsonFields(['tags']),
  validateSchema(updatePostSchema),
  PostsController.update,
);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Post deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: true
 *               message: "Deleted successfully"
 *               data: null
 *       400:
 *         description: Invalid identifier supplied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message:
 *                 "Post ID is invalid"
 *               data: null
 *       401:
 *         description: Missing/invalid bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *               data: null
 *       404:
 *         description: Post not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Post not found"
 *               data: null
 *       500:
 *         description: Unexpected error while deleting the post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               success: false
 *               message: "Internal Server Error"
 *               data: null
 */
privateRouter.delete('/posts/:id', auth, validateSchema(postIdParamSchema), PostsController.remove);

export { publicRouter, privateRouter };
