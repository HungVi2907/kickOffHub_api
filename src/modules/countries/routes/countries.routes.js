import express from 'express';
import auth from '../../../common/authMiddleware.js';
import CountriesController from '../controllers/countries.controller.js';

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
 * /api/countries:
 *   get:
 *     summary: List countries
 *     description: Returns a paginated collection of countries sorted alphabetically. Only exposes the public fields needed by the client.
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size (capped at 100).
 *     responses:
 *       200:
 *         description: Countries fetched successfully.
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
 *                           code:
 *                             type: string
 *                           flag:
 *                             type: string
 *                             format: uri
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
 *               message: "Countries retrieved successfully"
 *               data:
 *                 items:
 *                   - id: 1
 *                     name: "England"
 *                     code: "ENG"
 *                     flag: "https://flags.example/eng.png"
 *                 pagination:
 *                   totalItems: 171
 *                   totalPages: 9
 *                   page: 1
 *                   limit: 20
 *       400:
 *         description: Invalid pagination parameters.
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
 *               message: "Limit value must be a positive integer"
 *               data: null
 *       500:
 *         description: Internal server error while querying countries.
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
 *               message: "Error retrieving countries list"
 *               data: null
 */
publicRouter.get('/countries', CountriesController.list);

/**
 * @openapi
 * /api/countries/search:
 *   get:
 *     summary: Search countries
 *     description: Performs a case-insensitive match on the country name and returns paginated matches along with the original keyword.
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Keyword to match against the country name.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results returned.
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
 *                           code:
 *                             type: string
 *                           flag:
 *                             type: string
 *                             format: uri
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
 *                     keyword:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Countries search completed"
 *               data:
 *                 results:
 *                   - id: 84
 *                     name: "Japan"
 *                     code: "JPN"
 *                     flag: "https://flags.example/jpn.png"
 *                 pagination:
 *                   totalItems: 2
 *                   totalPages: 1
 *                   page: 1
 *                   limit: 20
 *                 keyword: "ja"
 *       400:
 *         description: Missing keyword or invalid pagination input.
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
 *               message: "Country name is required"
 *               data: null
 *       500:
 *         description: Internal server error while searching.
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
 *               message: "Error searching countries by name"
 *               data: null
 */
publicRouter.get('/countries/search', CountriesController.search);

/**
 * @openapi
 * /api/countries/{id}:
 *   get:
 *     summary: Country detail
 *     description: Fetches a single country by its identifier.
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Country identifier.
 *     responses:
 *       200:
 *         description: Country retrieved.
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
 *                     code:
 *                       type: string
 *                     flag:
 *                       type: string
 *                       format: uri
 *             example:
 *               success: true
 *               message: "Country retrieved"
 *               data:
 *                 id: 84
 *                 name: "Japan"
 *                 code: "JPN"
 *                 flag: "https://flags.example/jpn.png"
 *       400:
 *         description: Invalid identifier supplied.
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
 *               message: "Country Id is not valid"
 *               data: null
 *       404:
 *         description: Country not found.
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
 *               message: "Country does not exist"
 *               data: null
 *       500:
 *         description: Internal server error while retrieving the country.
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
 *               message: "Error retrieving country information"
 *               data: null
 */
publicRouter.get('/countries/:id', CountriesController.detail);

/**
 * @openapi
 * /api/countries:
 *   post:
 *     summary: Create country
 *     description: Adds a new country record. Requires authentication.
 *     tags:
 *       - Countries
 *     security:
 *       - bearerAuth: []
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
 *               code:
 *                 type: string
 *               flag:
 *                 type: string
 *                 format: uri
 *           example:
 *             name: "Vietnam"
 *             code: "VNM"
 *             flag: "https://flags.example/vnm.png"
 *     responses:
 *       201:
 *         description: Country created.
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
 *                     code:
 *                       type: string
 *                     flag:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Country created successfully"
 *               data:
 *                 id: 999
 *                 name: "Vietnam"
 *                 code: "VNM"
 *                 flag: "https://flags.example/vnm.png"
 *       400:
 *         description: Validation error (missing name or invalid code).
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
 *               message: "Name is required"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *         description: Internal server error while creating.
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
 *               message: "Error creating country"
 *               data: null
 */
privateRouter.post('/countries', auth, CountriesController.create);

/**
 * @openapi
 * /api/countries/{id}:
 *   put:
 *     summary: Update country
 *     description: Updates the name/code/flag for an existing country.
 *     tags:
 *       - Countries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
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
 *               flag:
 *                 type: string
 *                 format: uri
 *           example:
 *             name: "United Kingdom"
 *             code: "GBR"
 *             flag: "https://flags.example/gbr.png"
 *     responses:
 *       200:
 *         description: Country updated.
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
 *                     code:
 *                       type: string
 *                     flag:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Country updated successfully"
 *               data:
 *                 id: 1
 *                 name: "United Kingdom"
 *                 code: "GBR"
 *                 flag: "https://flags.example/gbr.png"
 *       400:
 *         description: Invalid identifier or payload.
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
 *               message: "Name is required"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *         description: Country not found.
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
 *               message: "Country does not exist"
 *               data: null
 *       500:
 *         description: Internal server error while updating.
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
 *               message: "Error updating country"
 *               data: null
 */
privateRouter.put('/countries/:id', auth, CountriesController.update);

/**
 * @openapi
 * /api/countries/{id}:
 *   delete:
 *     summary: Delete country
 *     description: Permanently removes a country record.
 *     tags:
 *       - Countries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Country deleted.
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
 *               message: "Country has been successfully deleted"
 *               data: null
 *       400:
 *         description: Invalid identifier supplied.
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
 *               message: "Country Id is not valid"
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
 *       403:
 *         description: Authenticated user lacks permission.
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
 *         description: Country not found.
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
 *               message: "Country does not exist"
 *               data: null
 *       500:
 *         description: Internal server error while deleting.
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
 *               message: "Error deleting country"
 *               data: null
 */
privateRouter.delete('/countries/:id', auth, CountriesController.remove);

export { publicRouter, privateRouter };
