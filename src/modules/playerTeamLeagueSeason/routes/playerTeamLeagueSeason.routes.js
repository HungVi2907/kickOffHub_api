/**
 * @file Player-Team-League-Season Routes
 * @description Express router configuration for player-team-league-season endpoints.
 *              Defines REST API routes for managing player-team-league-season relationships.
 * @module modules/playerTeamLeagueSeason/routes/playerTeamLeagueSeason
 */

import { Router } from 'express';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import PlayerTeamLeagueSeasonController from '../controllers/playerTeamLeagueSeason.controller.js';
import {
  createMappingSchema,
  deleteMappingSchema,
  listPlayersQuerySchema,
  updateMappingSchema,
} from '../validation/playerTeamLeagueSeason.validation.js';

/**
 * Express router for player-team-league-season endpoints.
 *
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @openapi
 * /api/player-team-league-season:
 *   post:
 *     summary: Upsert player-team-league-season mapping
 *     description: Creates a mapping or updates the existing row if the composite key already exists.
 *     tags:
 *       - Player-Team-League-Season
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - leagueId
 *               - teamId
 *               - season
 *             properties:
 *               playerId:
 *                 type: integer
 *                 minimum: 1
 *               leagueId:
 *                 type: integer
 *                 minimum: 1
 *               teamId:
 *                 type: integer
 *                 minimum: 1
 *               season:
 *                 type: integer
 *                 minimum: 1
 *           example:
 *             playerId: 394
 *             leagueId: 39
 *             teamId: 33
 *             season: 2024
 *     responses:
 *       201:
 *         description: Mapping created or refreshed.
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
 *               message: "Mapping saved"
 *               data:
 *                 playerId: 394
 *                 leagueId: 39
 *                 teamId: 33
 *                 season: 2024
 *       400:
 *         description: Validation failed (missing or invalid identifiers).
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
 *               message: "Payload is invalid"
 *               data: null
 *       409:
 *         description: Mapping cannot be created because related rows are missing.
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
 *               message: "Foreign key does not exist"
 *               data: null
 *       500:
 *         description: Unexpected error while saving the mapping.
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
 *               message: "Failed to create mapping"
 *               data: null
 */
router.post(
  '/player-team-league-season',
  validateSchema(createMappingSchema),
  PlayerTeamLeagueSeasonController.createMapping,
);

/**
 * @openapi
 * /api/player-team-league-season/players:
 *   get:
 *     summary: List players for team-league-season
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Players retrieved.
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
 *               message: "Players retrieved"
 *               data:
 *                 filters:
 *                   leagueId: 39
 *                   teamId: 33
 *                   season: 2024
 *                 total: 2
 *                 players:
 *                   - playerId: 394
 *                     teamId: 33
 *                     player:
 *                       id: 394
 *                       name: "Lionel Andrés Messi"
 *       400:
 *         description: Missing or invalid query parameters.
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
 *               message: "leagueId is required"
 *               data: null
 *       500:
 *         description: Unexpected error while retrieving players.
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
 *               message: "Failed to load players"
 *               data: null
 */
router.get(
  '/player-team-league-season/players',
  validateSchema(listPlayersQuerySchema),
  PlayerTeamLeagueSeasonController.findPlayersByTeamLeagueSeason,
);

/**
 * @openapi
 * /api/player-team-league-season/{playerId}/{leagueId}/{teamId}/{season}:
 *   put:
 *     summary: Update mapping
 *     description: Allows partial updates; duplicate composite keys are rejected.
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: integer
 *               leagueId:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *               season:
 *                 type: integer
 *           example:
 *             teamId: 55
 *             season: 2025
 *     responses:
 *       200:
 *         description: Mapping updated.
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
 *               message: "Mapping updated"
 *               data:
 *                 playerId: 394
 *                 teamId: 55
 *                 season: 2025
 *       400:
 *         description: Invalid parameters or body.
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
 *               message: "Payload is invalid"
 *               data: null
 *       404:
 *         description: Mapping not found.
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
 *               message: "Mapping does not exist"
 *               data: null
 *       409:
 *         description: Update would create a duplicate mapping or invalid references.
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
 *               message: "Duplicate mapping"
 *               data: null
 *       500:
 *         description: Unexpected error while updating.
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
 *               message: "Failed to update mapping"
 *               data: null
 */
router.put(
  '/player-team-league-season/:playerId/:leagueId/:teamId/:season',
  validateSchema(updateMappingSchema),
  PlayerTeamLeagueSeasonController.updateMapping,
);

/**
 * @openapi
 * /api/player-team-league-season/{playerId}/{leagueId}/{teamId}/{season}:
 *   delete:
 *     summary: Delete mapping
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Mapping deleted successfully.
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
 *               message: "Parameters are invalid"
 *               data: null
 *       404:
 *         description: Mapping not found.
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
 *                   nullable:
 *                     true
 *             example:
 *               success: false
 *               message: "Mapping does not exist"
 *               data: null
 *       500:
 *         description: Unexpected error while deleting.
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
 *               message: "Failed to delete mapping"
 *               data: null
 */
router.delete(
  '/player-team-league-season/:playerId/:leagueId/:teamId/:season',
  validateSchema(deleteMappingSchema),
  PlayerTeamLeagueSeasonController.deleteMapping,
);

export default router;
