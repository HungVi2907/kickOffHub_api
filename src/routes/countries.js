import express from 'express';
import CountriesController from '../controllers/countriesController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         flag:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 */

// Routes for Countries (English documentation)

/**
 * @openapi
 * /api/countries:
 *   get:
 *     summary: Get a list of all countries
 *     tags:
 *       - Countries
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
 *         description: Number of items per page
 *     description: Returns a paginated list of country objects limited to id, name, code, and flag fields.
 *     responses:
 *       200:
 *         description: Paginated list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         format: int32
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       flag:
 *                         type: string
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
 *                 - id: 1
 *                   name: "England"
 *                   code: "ENG"
 *                   flag: "url/to/flag.png"
 *               pagination:
 *                 totalItems: 171
 *                 totalPages: 9
 *                 page: 1
 *                 limit: 20
 *       500:
 *         description: Internal Server Error
 */
router.get('/countries', CountriesController.getAllCountries);          // GET /api/countries

/**
 * @openapi
 * /api/countries/search:
 *   get:
 *     summary: Search countries by name
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name or partial name of the country to search for
 *     description: Performs a case-insensitive search on the country name and returns all matches.
 *     responses:
 *       200:
 *         description: Matching countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     format: int32
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   flag:
 *                     type: string
 *             example:
 *               - id: 1
 *                 name: "England"
 *                 code: "ENG"
 *                 flag: "url/to/flag.png"
 *       400:
 *         description: Missing or empty name query parameter
 *       500:
 *         description: Internal Server Error
 */
router.get('/countries/search', CountriesController.getCountriesByName); // GET /api/countries/search

/**
 * @openapi
 * /api/countries/{id}:
 *   get:
 *     summary: Get a single country by ID
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the country to retrieve
 *     responses:
 *       200:
 *         description: Country object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *             example:
 *               id: 1
 *               name: "England"
 *               code: "ENG"
 *               flag: "url/to/flag.png"
 *       400:
 *         description: Invalid country ID supplied
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/countries/:id', CountriesController.getCountryById);      // GET /api/countries/:id

/**
 * @openapi
 * /api/countries:
 *   post:
 *     summary: Create a new country
 *     tags:
 *       - Countries
 *     requestBody:
 *       description: Country object to create (id is generated by the database)
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
 *             required:
 *               - name
 *           example:
 *             name: "England"
 *             code: "ENG"
 *             flag: "https://example.com/flags/eng.png"
 *     responses:
 *       201:
 *         description: Country created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *             example:
 *               id: 123
 *               name: "England"
 *               code: "ENG"
 *               flag: "https://example.com/flags/eng.png"
 *       400:
 *         description: Bad Request (invalid input)
 *       500:
 *         description: Internal Server Error
 */
router.post('/countries', CountriesController.createCountry);          // POST /api/countries

/**
 * @openapi
 * /api/countries/{id}:
 *   put:
 *     summary: Update an existing country by ID
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the country to update
 *     requestBody:
 *       description: Partial or full country object to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Country'
 *           example:
 *             name: "England"
 *             code: "ENG"
 *     responses:
 *       200:
 *         description: Country updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       400:
 *         description: Invalid country ID supplied or bad request payload
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/countries/:id', CountriesController.updateCountry);       // PUT /api/countries/:id

/**
 * @openapi
 * /api/countries/{id}:
 *   delete:
 *     summary: Delete a country by ID
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: The ID of the country to delete
 *     responses:
 *       200:
 *         description: Country deleted successfully
 *       400:
 *         description: Invalid country ID supplied
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/countries/:id', CountriesController.deleteCountry);    // DELETE /api/countries/:id
export default router;