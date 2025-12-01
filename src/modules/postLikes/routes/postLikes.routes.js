/**
 * @file Post Likes Routes
 * @description Express router configuration for post like-related endpoints.
 * Provides routes for toggling likes and retrieving like summaries.
 * @module modules/postLikes/routes/postLikes
 */

import { Router } from 'express';
import auth from '../../../common/authMiddleware.js';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import { postIdParamSchema } from '../../posts/validation/posts.validation.js';
import PostLikesController from '../controllers/postLikes.controller.js';

/**
 * Express router instance for post likes endpoints.
 * @type {Router}
 */
const router = Router();

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
 * /api/posts/{id}/like:
 *   post:
 *     summary: Toggle like on post
 *     description: Authenticated users can like or unlike a post; the endpoint returns the new state.
 *     tags:
 *       - Post Likes
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
 *         description: Like state toggled.
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
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Like toggled"
 *               data:
 *                 liked: true
 *                 likeCount: 12
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
 *               message: "Authentication required"
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
 *         description: Unexpected error while toggling the like.
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
 *               message: "Failed to toggle like"
 *               data: null
 */
router.post(
  '/posts/:id/like',
  auth,
  validateSchema(postIdParamSchema),
  PostLikesController.toggle,
);

/**
 * @openapi
 * /api/posts/{id}/likes:
 *   post:
 *     summary: Like a post
 *     description: Authenticated users can like a post.
 *     tags:
 *       - Post Likes
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
 *         description: Post liked successfully.
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
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Post not found.
 */
router.post(
  '/posts/:id/likes',
  auth,
  validateSchema(postIdParamSchema),
  PostLikesController.add,
);

/**
 * @openapi
 * /api/posts/{id}/likes:
 *   delete:
 *     summary: Unlike a post
 *     description: Authenticated users can remove their like from a post.
 *     tags:
 *       - Post Likes
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
 *         description: Like removed successfully.
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
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Post not found.
 */
router.delete(
  '/posts/:id/likes',
  auth,
  validateSchema(postIdParamSchema),
  PostLikesController.remove,
);

/**
 * @openapi
 * /api/posts/{id}/likes:
 *   get:
 *     summary: Get like summary for post
 *     description: Returns the current like count and whether the current user liked the post.
 *     tags:
 *       - Post Likes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Summary returned.
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
 *                     liked:
 *                       type: boolean
 *                     likeCount:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Like summary retrieved"
 *               data:
 *                 liked: false
 *                 likeCount: 42
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
 *         description: Unexpected error while building the summary.
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
 *               message: "Failed to retrieve like summary"
 *               data: null
 */
router.get(
  '/posts/:id/likes',
  validateSchema(postIdParamSchema),
  PostLikesController.summary,
);

export default router;
