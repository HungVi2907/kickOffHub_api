/**
 * @file Post Reports Routes
 * @description Express router configuration for post report-related endpoints.
 * Provides routes for users to report inappropriate posts for moderation.
 * @module modules/postReports/routes/postReports
 */

import { Router } from 'express';
import auth from '../../../common/authMiddleware.js';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import PostReportsController from '../controllers/postReports.controller.js';
import { reportPostSchema } from '../validation/postReports.validation.js';

/**
 * Express router instance for post reports endpoints.
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
 * /api/posts/{id}/report:
 *   post:
 *     summary: Report post
 *     description: Authenticated users can flag a post with an optional reason; repeat submissions update the existing report.
 *     tags:
 *       - Post Reports
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional explanation for the report.
 *           example:
 *             reason: "Spam content"
 *     responses:
 *       201:
 *         description: Report recorded.
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
 *                     status:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     totalReports:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Report received"
 *               data:
 *                 id: 77
 *                 status: "pending"
 *                 reason: "Spam content"
 *                 totalReports: 5
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
 *         description: Unexpected error while recording the report.
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
 *               message: "Failed to create report"
 *               data: null
 */
router.post(
  '/posts/:id/report',
  auth,
  validateSchema(reportPostSchema),
  PostReportsController.report,
);

export default router;
