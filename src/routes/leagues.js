import express from 'express';
import LeaguesController from '../controllers/leaguesController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     League:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         logo:
 *           type: string
 *       required:
 *         - name
 */

// Routes for Leagues (English documentation)

/**
 * @openapi
 * /api/leagues:
 *   get:
 *     summary: Get a list of leagues
 *     tags:
 *       - Leagues
 *     description: Returns an array of league objects.
 *     responses:
 *       200:
 *         description: List of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League'
 *             example: [{ "name": "Premier League", "type": "league", "logo": "https://.../pl.png" }]
 *       500:
 *         description: Internal Server Error
 */
router.get('/leagues', LeaguesController.getAllLeagues);          // GET /api/leagues

router.get('/leagues/search', LeaguesController.searchLeaguesByName);

/**
 * @openapi
 * /api/leagues/{id}:
 *   get:
 *     summary: Get a single league by ID
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the league to retrieve
 *     responses:
 *       200:
 *         description: League object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *             example:
 *               name: "Premier League"
 *               type: "league"
 *               logo: "https://.../pl.png"
 *       400:
 *         description: Invalid league ID supplied
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/leagues/:id', LeaguesController.getLeagueById);      // GET /api/leagues/:id

/**
 * @openapi
 * /api/leagues:
 *   post:
 *     summary: Create a new league
 *     tags:
 *       - Leagues
 *     requestBody:
 *       description: League object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 format: int32
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               logo:
 *                 type: string
 *             required:
 *               - id
 *               - name
 *           example:
 *             id: 39
 *             name: "Premier League"
 *             type: "league"
 *             logo: "https://example.com/logo.png"
 *     responses:
 *       201:
 *         description: League created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       400:
 *         description: Bad Request (invalid input)
 *       500:
 *         description: Internal Server Error
 */
router.post('/leagues', LeaguesController.createLeague);          // POST /api/leagues

/**
 * @openapi
 * /api/leagues/{id}:
 *   put:
 *     summary: Update an existing league by ID (partial updates allowed)
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the league to update
 *     requestBody:
 *       description: Fields to update (at least one of `name`, `type`, `logo`)
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
 *           example:
 *             name: "Premier League"
 *             logo: "https://example.com/logo.png"
 *     responses:
 *       200:
 *         description: League updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       400:
 *         description: Invalid league ID supplied or request payload invalid
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/leagues/:id', LeaguesController.updateLeague);       // PUT /api/leagues/:id

/**
 * @openapi
 * /api/leagues/{id}:
 *   delete:
 *     summary: Delete a league by ID
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the league to delete
 *     responses:
 *       200:
 *         description: League deleted successfully
 *       400:
 *         description: Invalid league ID supplied
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/leagues/:id', LeaguesController.deleteLeague);    // DELETE /api/leagues/:id

export default router;