import express from 'express';
import SeasonsController from '../controllers/seasonsController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Season:
 *       type: object
 *       properties:
 *         season:
 *           type: integer
 *           example: 2024
 *       description: Calendar year tracked by the football API. Each record is unique.
 */

/**
 * @openapi
 * /api/seasons:
 *   get:
 *     summary: List all seasons available in the system
 *     description: Returns every stored season ordered from the most recent to the oldest. Use this endpoint to populate dropdowns or validate user input.
 *     tags:
 *       - Seasons
 *     responses:
 *       200:
 *         description: Seasons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Season'
 *             example:
 *               - season: 2024
 *               - season: 2023
 *       500:
 *         description: Server failed to fetch the season list
 */
router.get('/seasons', SeasonsController.getAllSeasons);

/**
 * @openapi
 * /api/seasons:
 *   post:
 *     summary: Create or reuse a season entry
 *     description: Accepts a calendar year and stores it if it does not exist. When the season already exists, the endpoint simply returns the record without creating a duplicate.
 *     tags:
 *       - Seasons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Season'
 *           example:
 *             season: 2025
 *     responses:
 *       201:
 *         description: Season created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Season'
 *             example:
 *               season: 2025
 *       200:
 *         description: Season already existed; the existing record is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Season'
 *             example:
 *               season: 2023
 *       400:
 *         description: Provided season value is not a valid integer year
 *       500:
 *         description: Server failed to create or find the season
 */
router.post('/seasons', SeasonsController.createSeason);

/**
 * @openapi
 * /api/seasons/{season}:
 *   delete:
 *     summary: Remove a season by year
 *     description: Deletes the row that matches the requested season year. Use carefully, as removing a season may break references in other parts of the system.
 *     tags:
 *       - Seasons
 *     parameters:
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *         description: Calendar year to remove
 *         example: 2022
 *     responses:
 *       200:
 *         description: Season removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Season đã được xóa thành công"
 *       400:
 *         description: Season path parameter is not a valid integer year
 *       404:
 *         description: Season does not exist in the database
 *       500:
 *         description: Server failed to delete the season
 */
router.delete('/seasons/:season', SeasonsController.deleteSeason);

export default router;
