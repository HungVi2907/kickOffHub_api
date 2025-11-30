import { Router } from 'express';
import TagsController from '../controllers/tags.controller.js';

const router = Router();

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: List tags
 *     description: Returns every post tag available in the system ordered alphabetically. Useful for auto-complete inputs on the forum UI.
 *     tags:
 *       - Tags
 *     responses:
 *       200:
 *         description: Tags retrieved.
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       label:
 *                         type: string
 *             example:
 *               success: true
 *               message: "Tags retrieved"
 *               data:
 *                 - id: 1
 *                   slug: "premier-league"
 *                   label: "Premier League"
 *       500:
 *         description: Unexpected error while listing tags.
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
router.get('/tags', TagsController.list);

export default router;
