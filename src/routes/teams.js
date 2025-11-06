import express from 'express';
import teamsController from '../controllers/teamsController.js';

const router = express.Router();
// Routes for Teams

/**
 * @openapi
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Unique identifier for the team
 *         name:
 *           type: string
 *           description: The name of the team
 *         code:
 *           type: string
 *           description: Short code representing the team
 *         country:
 *           type: string
 *           description: The country where the team is based
 *         founded:
 *           type: integer
 *           description: The year the team was founded
 *         national:
 *           type: boolean
 *           description: Indicates if this is a national team
 *         logo:
 *           type: string
 *           description: URL to the team's logo image
 *         venue_id:
 *           type: integer
 *           description: The ID of the team's home venue
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the team record was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the team record was last updated
 *       required:
 *         - name
 *       example:
 *         id: 1
 *         name: "Manchester United"
 *         code: "MUN"
 *         country: "England"
 *         founded: 1878
 *         national: false
 *         logo: "https://example.com/logo.png"
 *         venue_id: 556
 *         created_at: "2023-01-01T00:00:00Z"
 *         updated_at: "2023-01-01T00:00:00Z"
 */

/**
 * @openapi
 * /api/teams:
 *   get:
 *     summary: Retrieve a list of all teams
 *     description: This endpoint returns a list of all teams in the system. Useful for displaying available teams or for administrative purposes.
 *     tags:
 *       - Teams
 *     responses:
 *       200:
 *         description: A list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *             example:
 *               - id: 1
 *                 name: "Manchester United"
 *                 code: "MUN"
 *                 country: "England"
 *                 founded: 1878
 *                 national: false
 *                 logo: "https://example.com/logo.png"
 *                 venue_id: 556
 *                 created_at: "2023-01-01T00:00:00Z"
 *                 updated_at: "2023-01-01T00:00:00Z"
 *               - id: 2
 *                 name: "Real Madrid"
 *                 code: "RMA"
 *                 country: "Spain"
 *                 founded: 1902
 *                 national: false
 *                 logo: "https://example.com/logo2.png"
 *                 venue_id: 1456
 *                 created_at: "2023-01-01T00:00:00Z"
 *                 updated_at: "2023-01-01T00:00:00Z"
 *       500:
 *         description: Internal server error occurred while retrieving teams
 */
router.get('/teams', teamsController.getAllTeams);          // GET /api/teams

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
 *     responses:
 *       200:
 *         description: A list of teams in the specified league
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *             example:
 *               - id: 1
 *                 name: "Manchester United"
 *                 code: "MUN"
 *                 country: "England"
 *                 founded: 1878
 *                 national: false
 *                 logo: "https://example.com/logo.png"
 *                 venue_id: 556
 *                 created_at: "2023-01-01T00:00:00Z"
 *                 updated_at: "2023-01-01T00:00:00Z"
 *       400:
 *         description: Invalid league ID provided
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal server error occurred while retrieving teams
 */
router.get('/teams/league/:leagueID', teamsController.getTeamsByLeague); // GET /api/teams/league/:leagueID

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
 *         description: Statistics for the team in the specified league and season
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               teamId: 33
 *               leagueId: 39
 *               season: 2023
 *               source: "API-Football"
 *               payload: { }
 *       400:
 *         description: Invalid teamId, leagueId, or season parameter
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error occurred while retrieving statistics
 */
router.get('/teams/:teamId/leagues/:leagueId/season/:season/stats', teamsController.getStatsByTeamIdAndSeason); // GET /api/teams/:teamId/leagues/:leagueId/season/:season/stats

/**
 * @openapi
 * /api/teams/{name}/search:
 *   get:
 *     summary: Search teams by name
 *     description: This endpoint searches for teams whose names match or contain the provided search term. The search is case-insensitive and supports partial matches.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name or partial name of the team to search for
 *         example: "Manchester"
 *     responses:
 *       200:
 *         description: A list of teams matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *             example:
 *               - id: 1
 *                 name: "Manchester United"
 *                 code: "MUN"
 *                 country: "England"
 *                 founded: 1878
 *                 national: false
 *                 logo: "https://example.com/logo.png"
 *                 venue_id: 556
 *                 created_at: "2023-01-01T00:00:00Z"
 *                 updated_at: "2023-01-01T00:00:00Z"
 *       400:
 *         description: Invalid search term provided
 *       500:
 *         description: Internal server error occurred during search
 */
router.get('/teams/:name/search', teamsController.searchTeamsByName); // GET /api/teams/:name/search

/**
 * @openapi
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     description: This endpoint allows you to create a new team by providing the required information in the request body. The team name is mandatory.
 *     tags:
 *       - Teams
 *     requestBody:
 *       description: The data for the new team
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the team
 *               code:
 *                 type: string
 *                 description: Short code for the team
 *               country:
 *                 type: string
 *                 description: The country of the team
 *               founded:
 *                 type: integer
 *                 description: The founding year
 *               national:
 *                 type: boolean
 *                 description: Whether it's a national team
 *               logo:
 *                 type: string
 *                 description: URL to the team's logo
 *               venue_id:
 *                 type: integer
 *                 description: ID of the home venue
 *             required:
 *               - name
 *           example:
 *             name: "New Team FC"
 *             code: "NTFC"
 *             country: "England"
 *             founded: 2020
 *             national: false
 *             logo: "https://example.com/newlogo.png"
 *             venue_id: 123
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 3
 *               name: "New Team FC"
 *               code: "NTFC"
 *               country: "England"
 *               founded: 2020
 *               national: false
 *               logo: "https://example.com/newlogo.png"
 *               venue_id: 123
 *               created_at: "2023-11-04T12:00:00Z"
 *               updated_at: "2023-11-04T12:00:00Z"
 *       400:
 *         description: Invalid input data provided
 *       500:
 *         description: Internal server error occurred while creating the team
 */
router.post('/teams', teamsController.createTeam);          // POST /api/teams

/**
 * @openapi
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team by ID
 *     description: This endpoint updates the information of an existing team. Provide the team ID in the URL path and the updated data in the request body.
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the team to update
 *         example: 1
 *     requestBody:
 *       description: The updated data for the team
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *           example:
 *             name: "Updated Team Name"
 *             code: "UTN"
 *             country: "England"
 *             founded: 1878
 *             national: false
 *             logo: "https://example.com/updatedlogo.png"
 *             venue_id: 556
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 1
 *               name: "Updated Team Name"
 *               code: "UTN"
 *               country: "England"
 *               founded: 1878
 *               national: false
 *               logo: "https://example.com/updatedlogo.png"
 *               venue_id: 556
 *               created_at: "2023-01-01T00:00:00Z"
 *               updated_at: "2023-11-04T12:00:00Z"
 *       400:
 *         description: Invalid input data or team ID
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error occurred while updating the team
 */
router.put('/teams/:id', teamsController.updateTeam);       // PUT /api/teams/:id

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
 *     responses:
 *       204:
 *         description: Team deleted successfully (no content returned)
 *       400:
 *         description: Invalid team ID
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error occurred while deleting the team
 */
router.delete('/teams/:id', teamsController.deleteTeam);    // DELETE /api/teams/:id
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
 *         description: Team information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 1
 *               name: "Manchester United"
 *               code: "MUN"
 *               country: "England"
 *               founded: 1878
 *               national: false
 *               logo: "https://example.com/logo.png"
 *               venue_id: 556
 *               created_at: "2023-01-01T00:00:00Z"
 *               updated_at: "2023-01-01T00:00:00Z"
 *       400:
 *         description: Invalid team ID
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error occurred while retrieving the team
 */
router.get('/teams/:id', teamsController.getTeamById);     // GET /api/teams/:id

export default router;