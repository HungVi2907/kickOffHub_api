import express from 'express';
import venuesController from '../controllers/venuesController.js';

const router = express.Router();

// Routes for Venues (English documentation)

/**
 * @openapi
 * components:
 *   schemas:
 *     Venue:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         capacity:
 *           type: integer
 *         surface:
 *           type: string
 *         image:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required: []
 */

/**
 * @openapi
 * /api/venues:
 *   get:
 *     summary: Get a list of venues
 *     tags:
 *       - Venues
 *     description: Returns an array of venue objects.
 *     responses:
 *       200:
 *         description: List of venues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venue'
 *             example: [{ "id": 1, "name": "Emirates Stadium", "city": "London", "capacity": 60260 }]
 *       500:
 *         description: Internal Server Error
 */
router.get('/venues', venuesController.getAllVenues);          // GET /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   get:
 *     summary: Get a venue by ID
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the venue to retrieve
 *     responses:
 *       200:
 *         description: Venue object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *             example: { "id": 1, "name": "Emirates Stadium", "city": "London", "capacity": 60260 }
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/venues/:id', venuesController.getVenueById);      // GET /api/venues/:id

/**
 * @openapi
 * /api/venues:
 *   post:
 *     summary: Create a new venue
 *     tags:
 *       - Venues
 *     requestBody:
 *       description: Venue object to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               surface:
 *                 type: string
 *               image:
 *                 type: string
 *           example:
 *             name: "Emirates Stadium"
 *             address: "Hornsey Rd, London N7 7AJ"
 *             city: "London"
 *             capacity: 60260
 *     responses:
 *       201:
 *         description: Venue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       400:
 *         description: Bad Request (invalid input)
 *       500:
 *         description: Internal Server Error
 */
router.post('/venues', venuesController.createVenue);          // POST /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   put:
 *     summary: Update a venue by ID
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the venue to update
 *     requestBody:
 *       description: Updated venue object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venue'
 *           example: { "name": "Emirates Stadium", "city": "London" }
 *     responses:
 *       200:
 *         description: Venue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       400:
 *         description: Bad Request (invalid input)
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/venues/:id', venuesController.updateVenue);       // PUT /api/venues/:id

/**
 * @openapi
 * /api/venues/{id}:
 *   delete:
 *     summary: Delete a venue by ID
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the venue to delete
 *     responses:
 *       200:
 *         description: Venue deleted successfully
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/venues/:id', venuesController.deleteVenue);    // DELETE /api/venues/:id

/**
 * @openapi
 * /api/venues/import:
 *   post:
 *     summary: Import venues from a league into the database
 *     tags:
 *       - Venues
 *     requestBody:
 *       description: Provide optional leagueId and season to import (default values will be used if omitted)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leagueId:
 *                 type: integer
 *               season:
 *                 type: integer
 *           example: { "leagueId": 39, "season": 2023 }
 *     responses:
 *       200:
 *         description: Import completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imported:
 *                   type: integer
 *             example: { "message": "Import venues completed", "imported": 10 }
 *       500:
 *         description: Internal Server Error
 */
router.post('/venues/import', venuesController.importVenuesFromLeague); // POST /api/venues/import-from-league
export default router;