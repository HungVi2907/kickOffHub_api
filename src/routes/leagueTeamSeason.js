import express from 'express';
import LeagueTeamSeasonController from '../controllers/leagueTeamSeasonController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     LeagueTeamSeason:
 *       type: object
 *       description: Join table that maps each team to a league for a given season.
 *       properties:
 *         leagueId:
 *           type: integer
 *           format: int32
 *           example: 39
 *         teamId:
 *           type: integer
 *           format: int32
 *           example: 33
 *         season:
 *           type: integer
 *           format: int32
 *           example: 2023
 *       required:
 *         - leagueId
 *         - teamId
 *         - season
 */

/**
 * @openapi
 * /api/leagues_teams_season:
 *   get:
 *     summary: Retrieve every league-team-season mapping
 *     description: Returns the raw mapping rows. Use this endpoint when you need to audit or export the relationships without joining additional data.
 *     tags:
 *       - League Team Season
 *     responses:
 *       200:
 *         description: Mappings returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeagueTeamSeason'
 *             example:
 *               - leagueId: 39
 *                 teamId: 33
 *                 season: 2023
 *               - leagueId: 39
 *                 teamId: 34
 *                 season: 2023
 *       500:
 *         description: Server could not fetch the mapping data
 */
router.get('/leagues_teams_season', LeagueTeamSeasonController.getAll);

/**
 * @openapi
 * /api/leagues_teams_season/teams/leagues/{leagueId}/seasons/{season}:
 *   get:
 *     summary: Fetch detailed teams for a league and season
 *     description: Looks up all team IDs registered for the league-season pair and returns the corresponding team records. Timestamp columns are omitted from the response to keep the payload lightweight for dropdowns and listings.
 *     tags:
 *       - League Team Season
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: League identifier from the external football data provider
 *         example: 39
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *         description: Season (calendar year) to filter by
 *         example: 2023
 *     responses:
 *       200:
 *         description: Teams participating in the requested league and season
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *             example:
 *               - id: 33
 *                 name: "Manchester United"
 *                 code: "MUN"
 *                 country: "England"
 *                 founded: 1878
 *                 national: false
 *                 logo: "https://media.api-sports.io/football/teams/33.png"
 *                 venue_id: 556
 *               - id: 34
 *                 name: "Newcastle United"
 *                 code: "NEW"
 *                 country: "England"
 *                 founded: 1892
 *                 national: false
 *                 logo: "https://media.api-sports.io/football/teams/34.png"
 *                 venue_id: 562
 *       400:
 *         description: leagueId or season is not a valid integer
 *       500:
 *         description: Server failed to resolve teams for the requested league and season
 */
router.get('/leagues_teams_season/teams/leagues/:leagueId/seasons/:season', LeagueTeamSeasonController.getByLeagueAndSeason);

/**
 * @openapi
 * /api/leagues_teams_season/league/{leagueId}/team/{teamId}/season/{season}:
 *   delete:
 *     summary: Remove a league-team-season mapping
 *     description: Deletes the specific mapping so the team is no longer associated with the league for that season. Use this endpoint when correcting data imports.
 *     tags:
 *       - League Team Season
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: League identifier to remove
 *         example: 39
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team identifier to remove
 *         example: 33
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *         description: Season year to remove
 *         example: 2023
 *     responses:
 *       200:
 *         description: Mapping deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bản ghi đã được xóa thành công"
 *       400:
 *         description: At least one path parameter is not a valid integer
 *       404:
 *         description: Mapping not found for the provided identifiers
 *       500:
 *         description: Server failed to delete the mapping
 */
router.delete('/leagues_teams_season/league/:leagueId/team/:teamId/season/:season', LeagueTeamSeasonController.deleteEntry);

export default router;
