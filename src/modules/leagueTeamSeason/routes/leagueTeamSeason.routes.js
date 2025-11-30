import { Router } from 'express';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import LeagueTeamSeasonController from '../controllers/leagueTeamSeason.controller.js';
import {
  leagueSeasonParamsSchema,
  leagueTeamSeasonParamsSchema,
  listQuerySchema,
} from '../validation/leagueTeamSeason.validation.js';

const router = Router();

/**
 * @openapi
 * /api/leagues_teams_season:
 *   get:
 *     summary: List league-team-season mappings
 *     description: Optionally filter by leagueId, teamId, or season via query parameters.
 *     tags:
 *       - League Team Season
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Filtered mappings returned.
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
 *                       leagueId:
 *                         type: integer
 *                       teamId:
 *                         type: integer
 *                       season:
 *                         type: integer
 *             example:
 *               success: true
 *               message: "Mappings retrieved"
 *               data:
 *                 - leagueId: 39
 *                   teamId: 33
 *                   season: 2024
 *       400:
 *         description: Invalid query parameters supplied.
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
 *               message: "Must be a positive integer"
 *               data: null
 *       500:
 *         description: Unexpected error while listing mappings.
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
 *               message: "Failed to list league-team-season mappings"
 *               data: null
 */
router.get('/leagues_teams_season', validateSchema(listQuerySchema), LeagueTeamSeasonController.list);

/**
 * @openapi
 * /api/leagues_teams_season/teams/leagues/{leagueId}/seasons/{season}:
 *   get:
 *     summary: List teams for league-season
 *     description: Returns the teams registered for the specified league and season.
 *     tags:
 *       - League Team Season
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Teams retrieved.
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
 *                     additionalProperties: true
 *             example:
 *               success: true
 *               message: "Teams retrieved"
 *               data:
 *                 - id: 33
 *                   name: "Manchester United"
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
 *               message: "Must be a positive integer"
 *               data: null
 *       404:
 *         description: No mappings found for the requested league/season.
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
 *               message: "No teams mapped to this league and season"
 *               data: null
 *       500:
 *         description: Unexpected error while retrieving teams.
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
 *               message: "Failed to load teams"
 *               data: null
 */
router.get(
  '/leagues_teams_season/teams/leagues/:leagueId/seasons/:season',
  validateSchema(leagueSeasonParamsSchema),
  LeagueTeamSeasonController.listTeams,
);

/**
 * @openapi
 * /api/leagues_teams_season/league/{leagueId}/team/{teamId}/season/{season}:
 *   delete:
 *     summary: Delete league-team-season mapping
 *     description: Removes the association between a team and league for a season.
 *     tags:
 *       - League Team Season
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Mapping deleted.
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
 *               message: "Record has been successfully deleted"
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
 *               message: "Must be a positive integer"
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
 *       500:
 *         description: Unexpected error while deleting the mapping.
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
  '/leagues_teams_season/league/:leagueId/team/:teamId/season/:season',
  validateSchema(leagueTeamSeasonParamsSchema),
  LeagueTeamSeasonController.remove,
);

export default router;
