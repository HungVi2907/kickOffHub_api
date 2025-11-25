import express from 'express';
import playersController from '../controllers/playersController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Unique identifier of the player
 *         name:
 *           type: string
 *           description: Full display name
 *         firstname:
 *           type: string
 *           description: First name (if available)
 *         lastname:
 *           type: string
 *           description: Last name (if available)
 *         age:
 *           type: integer
 *           format: int32
 *           description: Current age
 *         birth_date:
 *           type: string
 *           format: date
 *           description: Birth date in ISO 8601 format (YYYY-MM-DD)
 *         birth_place:
 *           type: string
 *           description: Place of birth
 *         birth_country:
 *           type: string
 *           description: Country of birth
 *         nationality:
 *           type: string
 *           description: Playing nationality
 *         height:
 *           type: string
 *           description: Height as a string (e.g., "180 cm")
 *         weight:
 *           type: string
 *           description: Weight as a string (e.g., "75 kg")
 *         number:
 *           type: integer
 *           format: int32
 *           description: Current jersey number
 *         position:
 *           type: string
 *           description: Preferred position
 *         photo:
 *           type: string
 *           format: uri
 *           description: Profile photo (URL)
 *       required:
 *         - id
 *         - name
 *       example:
 *         id: 394
 *         name: "Lionel Andrés Messi"
 *         firstname: "Lionel"
 *         lastname: "Messi"
 *         age: 36
 *         birth_date: "1987-06-24"
 *         birth_place: "Rosario"
 *         birth_country: "Argentina"
 *         nationality: "Argentina"
 *         height: "170 cm"
 *         weight: "72 kg"
 *         number: 10
 *         position: "Forward"
 *         photo: "https://example.com/messi.png"
 *     Country:
 *       type: object
 *       description: Country information mapped from the countries table
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Country ID in the system
 *         name:
 *           type: string
 *           description: Country name
 *         code:
 *           type: string
 *           description: Country code, e.g., "AR"
 *         flag:
 *           type: string
 *           format: uri
 *           description: URL of the country flag image
 *     PlayerDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Player'
 *         - type: object
 *           properties:
 *             country:
 *               allOf:
 *                 - $ref: '#/components/schemas/Country'
 *               nullable: true
 *               description: Country found from nationality (null if no match)
 */

/**
 * @openapi
 * /api/players:
 *   get:
 *     summary: Get a list of players with pagination
 *     description: Returns a list of players, sorted by name. Users can adjust the page and page size via query strings.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Current page (starting from 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records per page.
 *     responses:
 *       200:
 *         description: List of players and pagination information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 pagination:
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
 *             example:
 *               data:
 *                 - id: 394
 *                   name: "Lionel Andrés Messi"
 *                   position: "Forward"
 *                   number: 10
 *                   nationality: "Argentina"
 *               pagination:
 *                 totalItems: 1200
 *                 totalPages: 60
 *                 page: 1
 *                 limit: 20
 *       400:
 *         description: Invalid pagination parameters (e.g., page <= 0).
 *         content:
 *           application/json:
 *             example:
 *               error: "Giá trị page phải là số nguyên dương"
 *       500:
 *         description: Internal server error while querying data.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error retrieving players list"
 */
router.get('/players', playersController.getAllPlayers);

/**
 * @openapi
 * /api/players/popular:
 *   get:
 *     summary: Get popular players (paginated)
 *     description: |
 *       Returns a paginated list of players marked as "popular" in the database.
 *       This endpoint uses standard HTTP status codes for success and error handling.
 *       
 *       Best practices followed:
 *         - Clear, explicit errors for invalid input (400).
 *         - Use pagination to avoid large responses.
 *         - Examples provided for request and response shapes.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (starts at 1). Use this to navigate results.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of players per page. Max allowed is 100.
 *     responses:
 *       200:
 *         description: A paginated list of popular players.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 pagination:
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
 *             example:
 *               data:
 *                 - id: 394
 *                   name: "Lionel Andrés Messi"
 *                   position: "Forward"
 *                   number: 10
 *                   nationality: "Argentina"
 *               pagination:
 *                 totalItems: 12
 *                 totalPages: 1
 *                 page: 1
 *                 limit: 20
 *       400:
 *         description: Invalid query parameters (for example, page <= 0 or limit out of range).
 *         content:
 *           application/json:
 *             example:
 *               error: "Giá trị page phải là số nguyên dương"
 *       500:
 *         description: Internal server error while fetching popular players.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error fetching popular players list"
 *     x-request-examples:
 *       - name: Example request
 *         value: "/api/players/popular?page=1&limit=20"
 */

router.get('/players/popular', playersController.getPopularPlayers);

/**
 * @openapi
 * /api/players/search:
 *   get:
 *     summary: Search players by display name
 *     description: Allows partial keyword search, case-insensitive. Returns up to 100 records.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword to search (at least 1 character).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of results to return.
 *     responses:
 *       200:
 *         description: List of matching results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 keyword:
 *                   type: string
 *             example:
 *               results:
 *                 - id: 448
 *                   name: "Cristiano Ronaldo"
 *                   nationality: "Portugal"
 *               total: 1
 *               limit: 20
 *               keyword: "ronaldo"
 *       400:
 *         description: Missing name parameter or invalid limit.
 *         content:
 *           application/json:
 *             example:
 *               error: "name parameter is required"
 *       500:
 *         description: Internal server error during search.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error searching for players"
 */
router.get('/players/search', playersController.searchPlayersByName);

/**
 * @openapi
 * /api/players/{id}:
 *   get:
 *     summary: Get details of a single player
 *     description: Returns player information along with country data (if determined from nationality).
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Player ID.
 *     responses:
 *       200:
 *         description: Detailed information of the player.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerDetail'
 *             example:
 *               id: 394
 *               name: "Lionel Andrés Messi"
 *               nationality: "Argentina"
 *               position: "Forward"
 *               country:
 *                 id: 9
 *                 name: "Argentina"
 *                 code: "AR"
 *                 flag: "https://example.com/flags/ar.svg"
 *       400:
 *         description: Invalid ID.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid player ID"
 *       404:
 *         description: Player not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Player not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error retrieving player information"
 */
router.get('/players/:id', playersController.getPlayerById);

/**
 * @openapi
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     description: Returns the created player record. ID and name are required.
 *     tags:
 *       - Players
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Player'
 *           example:
 *             id: 501
 *             name: "Nguyễn Văn A"
 *             nationality: "Vietnam"
 *             position: "Midfielder"
 *     responses:
 *       201:
 *         description: Player created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Missing required data or invalid ID.
 *         content:
 *           application/json:
 *             example:
 *               error: "Player ID is required and must be a positive integer"
 *       409:
 *         description: ID already exists in the system.
 *         content:
 *           application/json:
 *             example:
 *               error: "Player already exists"
 *       500:
 *         description: Internal server error during data saving.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error creating new player"
 */
router.post('/players', playersController.createPlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   put:
 *     summary: Update player information
 *     description: Allows partial updates. ID cannot be changed.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the player to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               position:
 *                 type: string
 *               number:
 *                 type: integer
 *           example:
 *             name: "Nguyễn Văn A"
 *             number: 8
 *             position: "Midfielder"
 *     responses:
 *       200:
 *         description: Player record after update.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Invalid update data.
 *         content:
 *           application/json:
 *             examples:
 *               invalidId:
 *                 summary: Invalid ID
 *                 value:
 *                   error: "Invalid player ID"
 *               emptyPayload:
 *                 summary: No fields to update
 *                 value:
 *                   error: "No data to update"
 *       404:
 *         description: Player not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Player not found for update"
 *       500:
 *         description: Internal server error during update.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error updating player"
 */
router.put('/players/:id', playersController.updatePlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   delete:
 *     summary: Delete a player from the system
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the player to delete.
 *     responses:
 *       204:
 *         description: Deletion successful, no content returned.
 *       400:
 *         description: Invalid ID.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid player ID"
 *       404:
 *         description: Player not found for deletion.
 *         content:
 *           application/json:
 *             example:
 *               error: "Player not found for deletion"
 *       500:
 *         description: Internal server error during deletion.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error deleting player"
 */
router.delete('/players/:id', playersController.deletePlayer);

/**
 * @openapi
 * /api/players-stats:
 *   get:
 *     summary: Get player statistics from API Football
 *     description: |
 *       Retrieves detailed player information and statistics from API Football (api-sports.io)
 *       based on filters: playerid, teamid, leagueid, season.
 *       
 *       **Example URL:**
 *       - `/players-stats?playerid=874&season=2021&leagueid=39&teamid=33`
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: playerid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Player ID (required)
 *       - in: query
 *         name: season
 *         required: false
 *         schema:
 *           type: integer
 *         description: Season (e.g., 2021, 2022)
 *       - in: query
 *         name: leagueid
 *         required: false
 *         schema:
 *           type: integer
 *         description: League ID (e.g., 39 = Premier League)
 *       - in: query
 *         name: teamid
 *         required: false
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Retrieval successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Data from API Football (original response from api-sports.io)
 *       400:
 *         description: playerid parameter not provided
 *         content:
 *           application/json:
 *             example:
 *               error: "playerid is required"
 *       504:
 *         description: Timeout when connecting to API Football
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Timeout when connecting to API Football"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Error getting player statistics"
 *               details: "Error details"
 */
router.get('/players-stats', playersController.getPlayerStatsWithFilters);


/**
 * @openapi
 * /api/players/import:
 *   post:
 *     summary: Import player data from API Football
 *     description: Calls API Football to load player lists by page and save/upsert into the `players` database.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Season to import (e.g., 2021).
 *       - in: query
 *         name: league
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: League ID in API Football (e.g., 39 = Premier League).
 *       - in: query
 *         name: team
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Team ID in API Football.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page of data to load.
 *     responses:
 *       200:
 *         description: Number of players successfully imported in the requested page.
 *         content:
 *           application/json:
 *             example:
 *               imported: 20
 *               mappingsInserted: 20
 *               mappingErrors: []
 *               season: 2021
 *               league: 39
 *               team: 33
 *               page: 1
 *               totalPages: 40
 *       400:
 *         description: Missing or invalid format for query `season`, `league`, or `page`.
 *         content:
 *           application/json:
 *             example:
 *               error: "season is required"
 *       500:
 *         description: Internal server error when calling API or saving data.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error importing players from API Football"
 */
router.post('/players/import', playersController.importPlayersFromApiFootball);
export default router;
