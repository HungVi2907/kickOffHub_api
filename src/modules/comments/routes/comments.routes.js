import express from 'express';
import auth from '../../../common/authMiddleware.js';
import commentRateLimiter from '../../../middlewares/commentRateLimiter.js';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import CommentsController from '../controllers/comments.controller.js';
import {
  createCommentSchema,
  deleteCommentSchema,
} from '../validation/comments.validation.js';

const privateRouter = express.Router();

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
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Create comment on post
 *     description: Authenticated users can leave a comment on a post. Requests are throttled by an application-level rate limiter.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifier of the post receiving the comment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *           example:
 *             content: "Great analysis, thanks for sharing!"
 *     responses:
 *       201:
 *         description: Comment created.
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
 *                     id:
 *                       type: integer
 *                     postId:
 *                       type: integer
 *                     author:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               message: "Comment created"
 *               data:
 *                 id: 42
 *                 postId: 10
 *                 content: "Great analysis, thanks for sharing!"
 *                 author:
 *                   id: 5
 *                   name: "Jane Doe"
 *                   email: "jane@example.com"
 *                 createdAt: "2025-12-01T09:00:00Z"
 *       400:
 *         description: Validation failed (invalid IDs or content length).
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
 *         description: Missing or invalid bearer token.
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
 *       429:
 *         description: Rate limit exceeded for rapid submissions.
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
 *               message: "Too many comments, please slow down"
 *               data: null
 *       500:
 *         description: Unexpected server error while creating the comment.
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
  '/posts/:postId/comments',
  auth,
  validateSchema(createCommentSchema),
  commentRateLimiter,
  CommentsController.create,
);

/**
 * @openapi
 * /api/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     description: Removes a comment authored by the authenticated user from a post.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifier of the post owning the comment.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifier of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment removed.
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
 *               message: "Comment removed"
 *               data: null
 *       400:
 *         description: Invalid identifiers supplied.
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
 *               message: "Invalid identifier"
 *               data: null
 *       401:
 *         description: Missing or invalid bearer token.
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
 *       403:
 *         description: Authenticated user is not allowed to delete this comment.
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
 *               message: "You cannot remove this comment"
 *               data: null
 *       404:
 *         description: Comment not found.
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
 *               message: "Comment not found"
 *               data: null
 *       500:
 *         description: Unexpected server error while deleting the comment.
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
privateRouter.delete(
  '/posts/:postId/comments/:commentId',
  auth,
  validateSchema(deleteCommentSchema),
  CommentsController.remove,
);

export { privateRouter };
