/**
 * @file Seasons Routes
 * @description Defines Express routes for season management endpoints.
 * Includes endpoints for listing, creating, and deleting seasons.
 * All routes are prefixed with /api/seasons when mounted.
 * @module modules/seasons/routes/seasons
 */

import { Router } from 'express';
import { validateSchema } from '../../../middlewares/validateSchema.js';
import SeasonsController from '../controllers/seasons.controller.js';
import {
  createSeasonSchema,
  deleteSeasonSchema,
} from '../validation/seasons.validation.js';

/**
 * Express router instance for seasons endpoints.
 * @type {import('express').Router}
 */
const router = Router();

/**
 * @openapi
 * /api/seasons:
 *   get:
 *     summary: List seasons
 *     description: Returns every stored season ordered from the most recent to the oldest. Useful for populating dropdowns or validating user selections.
 *     tags:
 *       - Seasons
 *     responses:
 *       200:
 *         description: Seasons retrieved.
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
 *                       season:
 *                         type: integer
 *             example:
 *               success: true
 *               message: "Seasons retrieved"
 *               data:
 *                 - season: 2024
 *                 - season: 2023
 *       500:
 *         description: Unexpected error while listing seasons.
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
router.get('/seasons', SeasonsController.list);

/**
 * @openapi
 * /api/seasons:
 *   post:
 *     summary: Create season
 *     description: Inserts a new season year if it does not already exist. Returns the existing season otherwise.
 *     tags:
 *       - Seasons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season
 *             properties:
 *               season:
 *                 type: integer
 *                 example: 2024
 *     responses:
 *       201:
 *         description: Season created.
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
 *                     season:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Season created"
 *               data:
 *                 season: 2024
 *       200:
 *         description: Season already exists; existing row returned.
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
 *                     season:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Season exists"
 *               data:
 *                 season: 2023
 *       400:
 *         description: Validation failed (missing or non-numeric season).
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
 *         description: Unexpected error while creating the season.
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
router.post('/seasons', validateSchema(createSeasonSchema), SeasonsController.create);

/**
 * @openapi
 * /api/seasons/{season}:
 *   delete:
 *     summary: Delete season
 *     description: Removes the season row that matches the provided year. Use carefully because other entities can reference seasons.
 *     tags:
 *       - Seasons
 *     parameters:
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2022
 *     responses:
 *       200:
 *         description: Season deleted.
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
 *               message: "Season deleted"
 *               data: null
 *       400:
 *         description: Invalid season parameter (non numeric).
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
 *         description: Season not found.
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
 *               message: "Season not found"
 *               data: null
 *       500:
 *         description: Unexpected error while deleting the season.
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
router.delete('/seasons/:season', validateSchema(deleteSeasonSchema), SeasonsController.remove);

export default router;
