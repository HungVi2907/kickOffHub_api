import express from 'express';
import playersController from '../controllers/players.controller.js';

const router = express.Router();

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
 * /api/players:
 *   get:
 *     summary: List players
 *     description: Returns a paginated, alphabetically sorted player list. Supports `page`, `limit`, and `nationality` query parameters to control pagination and filtering.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number to retrieve (starts at 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of records per page (capped at 100).
 *       - in: query
 *         name: nationality
 *         schema:
 *           type: string
 *         description: Filter players by nationality (case-insensitive). Example - "Argentina", "Brazil", "England".
 *     responses:
 *       200:
 *         description: Players fetched successfully.
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
 *                           nationality:
 *                             type: string
 *                           position:
 *                             type: string
 *                           number:
 *                             type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *             example:
 *               success: true
 *               message: "Players retrieved successfully"
 *               data:
 *                 items:
 *                   - id: 394
 *                     name: "Lionel Andrés Messi"
 *                     position: "Forward"
 *                     number: 10
 *                     nationality: "Argentina"
 *                 pagination:
 *                   totalItems: 1200
 *                   totalPages: 60
 *                   page: 1
 *                   limit: 20
 *       400:
 *         description: Bad request – invalid pagination parameters.
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
 *                   description: Always null when the request fails.
 *             example:
 *               success: false
 *               message: "Giá trị page phải là số nguyên dương"
 *               data: null
 *       500:
 *         description: Internal server error.
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
 *                   description: Always null when the request fails.
 *             example:
 *               success: false
 *               message: "Error retrieving players list"
 *               data: null
 */
router.get('/players', playersController.getAllPlayers);

/**
 * @openapi
 * /api/players/count:
 *   get:
 *     summary: Get players count
 *     description: Returns the total number of players in the database.
 *     tags:
 *       - Players
 *     responses:
 *       200:
 *         description: Players count retrieved successfully.
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
 *                     total:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Players count retrieved successfully"
 *               data:
 *                 total: 8500
 *       500:
 *         description: Internal server error while counting players.
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
 *               message: "Error retrieving players count"
 *               data: null
 */
router.get('/players/count', playersController.getCount);

/**
 * @openapi
 * /api/players/popular:
 *   get:
 *     summary: List popular players
 *     description: Returns players flagged as popular in the database, honoring the same pagination controls as the generic listing endpoint.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (starts at 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size cap (max 100) to avoid large payloads.
 *     responses:
 *       200:
 *         description: Popular players fetched successfully.
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
 *                           nationality:
 *                             type: string
 *                           position:
 *                             type: string
 *                           number:
 *                             type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *             example:
 *               success: true
 *               message: "Popular players retrieved successfully"
 *               data:
 *                 items:
 *                   - id: 394
 *                     name: "Lionel Andrés Messi"
 *                     nationality: "Argentina"
 *                     position: "Forward"
 *                 pagination:
 *                   totalItems: 12
 *                   totalPages: 1
 *                   page: 1
 *                   limit: 20
 *       400:
 *         description: Bad request – invalid pagination values.
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
 *                   description: Always null when validation fails.
 *             example:
 *               success: false
 *               message: "Giá trị page phải là số nguyên dương"
 *               data: null
 *       500:
 *         description: Internal server error while querying data.
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
 *                   description: Always null when a server error occurs.
 *             example:
 *               success: false
 *               message: "Error fetching popular players list"
 *               data: null
 */
router.get('/players/popular', playersController.getPopularPlayers);

/**
 * @openapi
 * /api/players/search:
 *   get:
 *     summary: Search players
 *     description: Performs a case-insensitive search on player display names and returns up to 100 matches.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Keyword fragment to match against player names.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of matches to return.
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
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           nationality:
 *                             type: string
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     keyword:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Players search completed successfully"
 *               data:
 *                 results:
 *                   - id: 448
 *                     name: "Cristiano Ronaldo"
 *                     nationality: "Portugal"
 *                 total: 1
 *                 limit: 20
 *                 keyword: "ronaldo"
 *       400:
 *         description: Bad request – missing or invalid query parameters.
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
 *                   description: Always null when the operation fails.
 *             example:
 *               success: false
 *               message: "name parameter is required"
 *               data: null
 *       500:
 *         description: Internal server error while executing the search.
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
 *                   description: Always null when a server error occurs.
 *             example:
 *               success: false
 *               message: "Error searching for players"
 *               data: null
 */
router.get('/players/search', playersController.searchPlayersByName);

/**
 * @openapi
 * /api/players/{id}:
 *   get:
 *     summary: Get player detail
 *     description: Retrieves a single player record along with derived country metadata when the nationality matches a known country.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Player identifier.
 *     responses:
 *       200:
 *         description: Player found.
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
 *                     name:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     position:
 *                       type: string
 *                     country:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         code:
 *                           type: string
 *                         flag:
 *                           type: string
 *                           format: uri
 *             example:
 *               success: true
 *               message: "Player retrieved successfully"
 *               data:
 *                 id: 394
 *                 name: "Lionel Andrés Messi"
 *                 nationality: "Argentina"
 *                 position: "Forward"
 *                 country:
 *                   id: 9
 *                   name: "Argentina"
 *                   code: "AR"
 *                   flag: "https://example.com/flags/ar.svg"
 *       400:
 *         description: Bad request – ID is not a positive integer.
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
 *                   description: Always null when validation fails.
 *             example:
 *               success: false
 *               message: "Invalid player ID"
 *               data: null
 *       404:
 *         description: Player not found.
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
 *               message: "Player not found"
 *               data: null
 *       500:
 *         description: Internal server error while retrieving the player.
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
 *               message: "Error retrieving player information"
 *               data: null
 */
router.get('/players/:id', playersController.getPlayerById);

/**
 * @openapi
 * /api/players:
 *   post:
 *     summary: Create player
 *     description: Authenticated staff can insert a new player record into the local database.
 *     tags:
 *       - Players
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
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               nationality:
 *                 type: string
 *               position:
 *                 type: string
 *               number:
 *                 type: integer
 *               age:
 *                 type: integer
 *               birth_date:
 *                 type: string
 *                 format: date
 *               birth_place:
 *                 type: string
 *               birth_country:
 *                 type: string
 *               height:
 *                 type: string
 *               weight:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: uri
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
 *                     name:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     position:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Player created successfully"
 *               data:
 *                 id: 501
 *                 name: "Nguyễn Văn A"
 *                 nationality: "Vietnam"
 *                 position: "Midfielder"
 *       400:
 *         description: Bad request – validation failed (missing id/name or invalid data).
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
 *               message: "Player ID is required and must be a positive integer"
 *               data: null
 *       401:
 *         description: Unauthorized – missing or invalid bearer token.
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
 *         description: Forbidden – authenticated user lacks create permissions.
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
 *       409:
 *         description: Conflict – player with the provided ID already exists.
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
 *               message: "Player already exists"
 *               data: null
 *       500:
 *         description: Internal server error while persisting the player.
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
 *               message: "Error creating new player"
 *               data: null
 */
router.post('/players', playersController.createPlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   put:
 *     summary: Update player
 *     description: Authenticated clients can partially update a player. Only mutable fields in the body are updated; the ID remains fixed via the path parameter.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Player identifier to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Provide at least one field to update.
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               position:
 *                 type: string
 *               number:
 *                 type: integer
 *               age:
 *                 type: integer
 *               photo:
 *                 type: string
 *           example:
 *             name: "Nguyễn Văn A"
 *             number: 8
 *             position: "Midfielder"
 *     responses:
 *       200:
 *         description: Player updated successfully.
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
 *                     name:
 *                       type: string
 *                     number:
 *                       type: integer
 *                     position:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Player updated successfully"
 *               data:
 *                 id: 501
 *                 name: "Nguyễn Văn A"
 *                 number: 8
 *                 position: "Midfielder"
 *       400:
 *         description: Bad request – invalid ID or payload.
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
 *             examples:
 *               invalidId:
 *                 summary: Invalid ID
 *                 value:
 *                   success: false
 *                   message: "Invalid player ID"
 *                   data: null
 *               emptyPayload:
 *                 summary: No data provided
 *                 value:
 *                   success: false
 *                   message: "No data to update"
 *                   data: null
 *       401:
 *         description: Unauthorized – missing or invalid token.
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
 *         description: Forbidden – authenticated user lacks update permissions.
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
 *         description: Player not found.
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
 *               message: "Player not found for update"
 *               data: null
 *       500:
 *         description: Internal server error while updating the player.
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
 *               message: "Error updating player"
 *               data: null
 */
router.put('/players/:id', playersController.updatePlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   delete:
 *     summary: Delete player
 *     description: Authenticated users with delete permissions can remove a player from the database.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifier of the player to delete.
 *     responses:
 *       200:
 *         description: Player removed.
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
 *               message: "Player deleted successfully"
 *               data: null
 *       400:
 *         description: Bad request – invalid ID.
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
 *               message: "Invalid player ID"
 *               data: null
 *       401:
 *         description: Unauthorized – missing or invalid token.
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
 *         description: Forbidden – lacks delete permissions.
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
 *         description: Player not found.
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
 *               message: "Player not found for deletion"
 *               data: null
 *       500:
 *         description: Internal server error while deleting the player.
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
 *               message: "Error deleting player"
 *               data: null
 */
router.delete('/players/:id', playersController.deletePlayer);

/**
 * @openapi
 * /api/players-stats:
 *   get:
 *     summary: Get player statistics
 *     description: Proxies API Football (api-sports.io) to fetch detailed player statistics using the provided filters.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: playerid
 *         required: true
 *         schema:
 *           type: integer
 *         description: API Football player identifier.
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         description: Season (e.g., 2022).
 *       - in: query
 *         name: leagueid
 *         schema:
 *           type: integer
 *         description: League identifier.
 *       - in: query
 *         name: teamid
 *         schema:
 *           type: integer
 *         description: Team identifier.
 *     responses:
 *       200:
 *         description: Statistics fetched successfully.
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
 *                   description: Raw response from API Football.
 *                   additionalProperties: true
 *             example:
 *               success: true
 *               message: "Player statistics retrieved successfully"
 *               data:
 *                 response:
 *                   - player:
 *                       id: 874
 *                       name: "Cristiano Ronaldo"
 *                     statistics: []
 *       400:
 *         description: Bad request – missing player ID or invalid filter values.
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
 *               message: "playerid is required"
 *               data: null
 *       504:
 *         description: Gateway timeout while contacting API Football.
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
 *               message: "Timeout when connecting to API Football"
 *               data: null
 *       500:
 *         description: Internal or upstream error while fetching stats.
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
 *               message: "Error getting player statistics"
 *               data: null
 */
router.get('/players-stats', playersController.getPlayerStatsWithFilters);

/**
 * @openapi
 * /api/players/import:
 *   post:
 *     summary: Import players from API Football
 *     description: Authenticated admins can trigger a background import that reads players from API Football for the specified season, league, team, and page.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
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
 *         description: League ID in API Football.
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
 *         description: External page to fetch (defaults to 1).
 *     responses:
 *       200:
 *         description: Import completed for the requested page.
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
 *                     season:
 *                       type: integer
 *                     league:
 *                       type: integer
 *                     team:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Players imported successfully"
 *               data:
 *                 imported: 20
 *                 mappingsInserted: 20
 *                 mappingErrors: []
 *                 season: 2021
 *                 league: 39
 *                 team: 33
 *                 page: 1
 *                 totalPages: 40
 *       400:
 *         description: Bad request – missing or invalid query parameters.
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
 *               message: "season is required"
 *               data: null
 *       401:
 *         description: Unauthorized – missing or invalid token.
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
 *         description: Forbidden – token lacks import permissions.
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
 *         description: Internal error when contacting API Football or storing data.
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
 *               message: "Error importing players from API Football"
 *               data: null
 */
router.post('/players/import', playersController.importPlayersFromApiFootball);

export default router;
