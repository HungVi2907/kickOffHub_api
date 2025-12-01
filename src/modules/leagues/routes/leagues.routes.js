/**
 * @fileoverview Leagues Routes Configuration
 * @description Express router definitions for league endpoints. Configures public
 * and private (authenticated) routes with validation middleware and OpenAPI documentation.
 * @module modules/leagues/routes/leagues
 * 
 * @exports publicRouter - Router for unauthenticated league endpoints (GET operations)
 * @exports privateRouter - Router for authenticated league endpoints (POST, PUT, DELETE operations)
 */

import { Router } from 'express';
import auth from '../../../common/authMiddleware.js';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import LeaguesController from '../controllers/leagues.controller.js';
import {
  createLeagueSchema,
  leagueIdParamSchema,
  searchLeaguesSchema,
  updateLeagueSchema,
} from '../validation/leagues.validation.js';

/** @type {import('express').Router} Public routes - no authentication required */
const publicRouter = Router();

/** @type {import('express').Router} Private routes - authentication required */
const privateRouter = Router();

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
 * /api/leagues:
 *   get:
 *     summary: List leagues
 *     description: Returns every league stored locally.
 *     tags:
 *       - Leagues
 *     responses:
 *       200:
 *         description: Leagues fetched successfully.
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           logo:
 *                             type: string
 *                             format: uri
 *             example:
 *               success: true
 *               message: "Leagues retrieved successfully"
 *               data:
 *                 items:
 *                   - id: 39
 *                     name: "Premier League"
 *                     type: "League"
 *                     logo: "https://logos.example/epl.png"
 *       500:
 *         description: Unexpected error while listing leagues.
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
 *               message: "Failed to retrieve leagues"
 *               data: null
 */
publicRouter.get('/leagues', LeaguesController.list);

/**
 * @openapi
 * /api/leagues/search:
 *   get:
 *     summary: Search leagues by name
 *     description: Supports pagination via page/limit query parameters.
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Search completed successfully.
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
 *               message: "Leagues search completed"
 *               data:
 *                 results:
 *                   - id: 39
 *                     name: "Premier League"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   totalPages: 1
 *                 keyword: "premier"
 *       400:
 *         description: Invalid keyword, limit, or page supplied.
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
 *               message: "LEAGUE_KEYWORD_REQUIRED"
 *               data: null
 *       500:
 *         description: Unexpected error while searching.
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
 *               message: "Failed to search leagues"
 *               data: null
 */
publicRouter.get('/leagues/search', validateSchema(searchLeaguesSchema), LeaguesController.search);

/**
 * @openapi
 * /api/leagues/{id}:
 *   get:
 *     summary: League detail
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: League retrieved.
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
 *               message: "League retrieved"
 *               data:
 *                 id: 39
 *                 name: "Premier League"
 *                 type: "League"
 *                 logo: "https://logos.example/epl.png"
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
 *               message: "LEAGUE_ID_INVALID"
 *               data: null
 *       404:
 *         description: League not found.
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
 *               message: "LEAGUE_NOT_FOUND"
 *               data: null
 *       500:
 *         description: Unexpected error while retrieving the league.
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
 *               message: "Failed to retrieve league"
 *               data: null
 */
publicRouter.get('/leagues/:id', validateSchema(leagueIdParamSchema), LeaguesController.detail);

/**
 * @openapi
 * /api/leagues:
 *   post:
 *     summary: Create league
 *     description: Creates a league row; requires authentication.
 *     tags:
 *       - Leagues
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: integer
 *                 minimum: 1
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *           example:
 *             id: 140
 *             name: "La Liga"
 *             type: "League"
 *             logo: "https://logos.example/laliga.png"
 *     responses:
 *       201:
 *         description: League created.
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
 *               message: "League created successfully"
 *               data:
 *                 id: 140
 *                 name: "La Liga"
 *                 type: "League"
 *       400:
 *         description: Invalid payload (missing id/name or malformed values).
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
 *               message: "LEAGUE_NAME_REQUIRED"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *               message: "Forbidden"
 *               data: null
 *       500:
 *         description: Unexpected error while creating the league.
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
 *               message: "Failed to create league"
 *               data: null
 */
privateRouter.post('/leagues', auth, validateSchema(createLeagueSchema), LeaguesController.create);

/**
 * @openapi
 * /api/leagues/{id}:
 *   put:
 *     summary: Update league
 *     tags:
 *       - Leagues
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
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *           example:
 *             name: "Premier League"
 *             logo: "https://logos.example/epl-v2.png"
 *     responses:
 *       200:
 *         description: League updated.
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
 *               message: "League updated successfully"
 *               data:
 *                 id: 39
 *                 name: "Premier League"
 *       400:
 *         description: Invalid payload (no fields to update) or identifier.
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
 *               message: "LEAGUE_UPDATE_EMPTY"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *                 "Forbidden"
 *               data: null
 *       404:
 *         description: League not found.
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
 *               message: "LEAGUE_NOT_FOUND"
 *               data: null
 *       500:
 *         description: Unexpected error while updating the league.
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
 *               message: "Failed to update league"
 *               data: null
 */
privateRouter.put('/leagues/:id', auth, validateSchema(updateLeagueSchema), LeaguesController.update);

/**
 * @openapi
 * /api/leagues/{id}:
 *   delete:
 *     summary: Delete league
 *     description: Removes a league by identifier.
 *     tags:
 *       - Leagues
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
 *         description: League deleted.
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
 *               message: "League has been successfully deleted"
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
 *               message: "LEAGUE_ID_INVALID"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *               message: "Forbidden"
 *               data: null
 *       404:
 *         description: League not found.
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
 *               message: "LEAGUE_NOT_FOUND"
 *               data: null
 *       500:
 *         description: Unexpected error while deleting the league.
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
 *               message: "Failed to delete league"
 *               data: null
 */
privateRouter.delete('/leagues/:id', auth, validateSchema(leagueIdParamSchema), LeaguesController.remove);

export { publicRouter, privateRouter };
