/**
 * @file Venues Routes
 * @description Express router configuration for venue-related endpoints.
 * Provides CRUD routes for venue management and API-Football import functionality.
 * @module modules/venues/routes/venues
 */

import express from 'express';
import VenuesController from '../controllers/venues.controller.js';

/**
 * Express router instance for venues endpoints.
 * @type {express.Router}
 */
const router = express.Router();

/**
 * @openapi
 * /api/venues:
 *   get:
 *     summary: List venues
 *     tags:
 *       - Venues
 *     responses:
 *       200:
 *         description: Venues retrieved.
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
 *               message: "Venues retrieved"
 *               data:
 *                 - id: 494
 *                   name: "Emirates Stadium"
 *                   city: "London"
 *       500:
 *         description: Unexpected error while listing venues.
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
router.get('/venues', VenuesController.getAllVenues);          // GET /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   get:
 *     summary: Get venue detail
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venue retrieved.
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
 *               message: "Venue retrieved"
 *               data:
 *                 id: 556
 *                 name: "Old Trafford"
 *                 capacity: 76212
 *       400:
 *         description: Invalid venue identifier.
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
 *         description: Venue not found.
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
 *               message: "Venue not found"
 *               data: null
 *       500:
 *         description: Unexpected error retrieving venue.
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
 */
router.get('/venues/:id', VenuesController.getVenueById);      // GET /api/venues/:id

/**
 * @openapi
 * /api/venues:
 *   post:
 *     summary: Create venue
 *     tags:
 *       - Venues
 *     requestBody:
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
 *             city: "London"
 *             capacity: 60260
 *     responses:
 *       201:
 *         description: Venue created.
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
 *       500:
 *         description: Unexpected error while creating venue.
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
 */
router.post('/venues', VenuesController.createVenue);          // POST /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   put:
 *     summary: Update venue
 *     tags:
 *       - Venues
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
 *     responses:
 *       200:
 *         description: Venue updated.
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
 *       404:
 *         description: Venue not found.
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
 *       500:
 *         description: Unexpected error while updating venue.
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
 */
router.put('/venues/:id', VenuesController.updateVenue);       // PUT /api/venues/:id

/**
 * @openapi
 * /api/venues/import:
 *   post:
 *     summary: Import venue from API-Football
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Import completed.
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
 *                     id:
 *                       type: integer
 *       400:
 *         description: Missing or invalid venue id.
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
 */
router.post('/venues/import', VenuesController.importVenuesFromApiFootball); // POST /api/venues/import

export default router;
