import express from 'express';
import auth from '../../../common/authMiddleware.js';
import TeamsController from '../controllers/teams.controller.js';

const publicRouter = express.Router();
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
 * /api/teams:
 *   get:
 *     summary: Retrieve a list of all teams
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page index (1-based)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *         description: Number of teams per page
 *     description: Returns a paginated list of teams ordered alphabetically by name.
 *     responses:
 *       200:
 *         description: Paginated list of teams.
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
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *             example:
 *               success: true
 *               message: "Teams retrieved"
 *               data:
 *                 totalItems: 2
 *                 totalPages: 1
 *                 page: 1
 *                 limit: 20
 *                 data:
 *                   - id: 1
 *                     name: "Manchester United"
 *                     country: "England"
 *                   - id: 2
 *                     name: "Real Madrid"
 *       500:
 *         description: Unexpected error while listing teams.
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
publicRouter.get('/teams', TeamsController.getAllTeams);          // GET /api/teams

/**
 * @openapi
 * /api/teams/league/{leagueID}:
 *   get:
 *     summary: Retrieve teams by league ID
 *     description: This endpoint fetches all teams that belong to a specific league. Provide the league ID in the URL path.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: leagueID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the league
 *         example: 39
 *       - in: query
 *         name: season
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Optional season year to filter by
 *     responses:
 *       200:
 *         description: Teams for the given league/season.
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
 *                 - id: 1
 *                   name: "Manchester United"
 *       400:
 *         description: Invalid league or season parameter.
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
 *       404:
 *         description: No teams mapped to the provided league/season.
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
 *               message: "No teams found"
 *               data: null
 *       500:
 *         description: Unexpected error while retrieving teams for the league.
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
publicRouter.get('/teams/league/:leagueID', TeamsController.getTeamsByLeague); // GET /api/teams/league/:leagueID

/**
 * @openapi
 * /api/teams/{teamId}/leagues/{leagueId}/season/{season}/stats:
 *   get:
 *     summary: Retrieve statistics for a specific team in a league for a season
 *     description: This endpoint provides statistical data for a team for a specific league and season. All parameters are required and must match API-Football requirements.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the team
 *         example: 33
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the league (API-Football league id)
 *         example: 39
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *         description: The season year for which to retrieve statistics (e.g., 2023)
 *         example: 2023
 *     responses:
 *       200:
 *         description: Statistics payload retrieved successfully.
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
 *               message: "Stats retrieved"
 *               data:
 *                 teamId: 33
 *                 leagueId: 39
 *                 season: 2023
 *                 payload: {}
 *       400:
 *         description: Invalid parameters supplied.
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
 *       404:
 *         description: Stats not found for the combination.
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
 *               message: "Stats not found"
 *               data: null
 *       500:
 *         description: Unexpected error while requesting stats.
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
publicRouter.get('/teams/:teamId/leagues/:leagueId/season/:season/stats', TeamsController.getStatsByTeamIdAndSeasonAndLeague); // GET /api/teams/:teamId/leagues/:leagueId/season/:season/stats

/**
 * @openapi
 * /api/teams/search:
 *   get:
 *     summary: Search teams by name
 *     description: This endpoint searches for teams whose names match or contain the provided search term. The search is case-insensitive and supports partial matches.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name or partial name of the team to search for
 *         example: "Manchester"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of teams to return (1-100)
 *     responses:
 *       200:
 *         description: Teams matching the query.
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
 *                     keyword:
 *                       type: string
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *             example:
 *               success: true
 *               message: "Teams retrieved"
 *               data:
 *                 keyword: "Manchester"
 *                 total: 1
 *                 limit: 20
 *                 results:
 *                   - id: 1
 *                     name: "Manchester United"
 *       400:
 *         description: Invalid query provided.
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
 *       500:
 *         description: Unexpected error during search.
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
publicRouter.get('/teams/search', TeamsController.searchTeamsByName); // GET /api/teams/search

/**
 * @openapi
 * /api/teams/popular:
 *   get:
 *     summary: Retrieve a list of popular teams
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page index (1-based)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *         description: Number of teams per page
 *     description: Returns a paginated list of popular teams ordered alphabetically by name.
 *     responses:
 *       200:
 *         description: Paginated list of popular teams.
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
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         additionalProperties: true
 *             example:
 *               success: true
 *               message: "Popular teams retrieved"
 *               data:
 *                 totalItems: 40
 *                 totalPages: 2
 *                 page: 1
 *                 limit: 20
 *                 data:
 *                   - id: 1
 *                     name: "Manchester United"
 *       500:
 *         description: Unexpected error while listing popular teams.
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
publicRouter.get('/teams/popular', TeamsController.getPopularTeams); // GET /api/teams/popular

/**
 * @openapi
 * /api/teams/{id}:
 *   get:
 *     summary: Retrieve a team by ID
 *     description: This endpoint fetches the details of a specific team using its unique identifier.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the team
 *         example: 1
 *     responses:
 *       200:
 *         description: Team information.
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
 *               message: "Team retrieved"
 *               data:
 *                 id: 1
 *                 name: "Manchester United"
 *       400:
 *         description: Invalid team identifier.
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
 *       404:
 *         description: Team not found.
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
 *               message: "Team not found"
 *               data: null
 *       500:
 *         description: Unexpected error retrieving the team.
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
publicRouter.get('/teams/:id', TeamsController.getTeamById);     // GET /api/teams/:id

/**
 * @openapi
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     description: This endpoint allows you to create a new team by providing the required information in the request body. The team name is mandatory.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: New team payload.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               country:
 *                 type: string
 *               founded:
 *                 type: integer
 *               national:
 *                 type: boolean
 *               logo:
 *                 type: string
 *               venue_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Team created.
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
 *               message: "Team created"
 *               data:
 *                 id: 3
 *                 name: "New Team FC"
 *       400:
 *         description: Validation failed.
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
 *         description: Unexpected error while creating team.
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
privateRouter.post('/teams', auth, TeamsController.createTeam);          // POST /api/teams

/**
 * @openapi
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team by ID
 *     description: This endpoint updates the information of an existing team. Provide the team ID in the URL path and the updated data in the request body.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               country:
 *                 type: string
 *               founded:
 *                 type: integer
 *               national:
 *                 type: boolean
 *               logo:
 *                 type: string
 *               venue_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Team updated.
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
 *       400:
 *         description: Validation failed.
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
 *         description: Team not found.
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
 *               message: "Team not found"
 *               data: null
 *       500:
 *         description: Unexpected error while updating team.
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
privateRouter.put('/teams/:id', auth, TeamsController.updateTeam);       // PUT /api/teams/:id

/**
 * @openapi
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team by ID
 *     description: This endpoint deletes a team from the system. Provide the team ID in the URL path. This action cannot be undone.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the team to delete
 *         example: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team deleted.
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
 *               message: "Team deleted"
 *               data: null
 *       400:
 *         description: Invalid team ID.
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
 *         description: Team not found.
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
 *               message: "Team not found"
 *               data: null
 *       500:
 *         description: Unexpected error while deleting team.
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
privateRouter.delete('/teams/:id', auth, TeamsController.deleteTeam);    // DELETE /api/teams/:id
/**
 * @openapi
 * /api/teams/import:
 *   post:
 *     summary: Import teams from API-Football
 *     description: Gọi API-Football để lấy danh sách đội bóng theo league và season, sau đó lưu vào bảng teams và leagues_teams_season.
 *     tags:
 *       - Teams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Season year (e.g., 2023).
 *       - in: query
 *         name: league
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: API-Football league identifier.
 *     responses:
 *       200:
 *         description: Import summary.
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
 *                     imported:
 *                       type: integer
 *                     mappingsInserted:
 *                       type: integer
 *                     mappingErrors:
 *                       type: array
 *                       items:
 *                         type: string
 *             example:
 *               success: true
 *               message: "Import completed"
 *               data:
 *                 imported: 20
 *                 mappingsInserted: 20
 *                 mappingErrors: []
 *                 season: 2023
 *                 league: 39
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
 *         description: API-Football or persistence failure.
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
privateRouter.post('/teams/import', auth, TeamsController.importTeamsFromApiFootball); // POST /api/teams/import

export { publicRouter, privateRouter };
