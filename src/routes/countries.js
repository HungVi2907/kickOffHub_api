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

// Định tuyến cho Countries

/**
 * @openapi
 * /api/countries:
 *   get:
 *     summary: Lấy danh sách tất cả countries
 *     tags:
 *       - Countries
 *     responses:
 *       200:
 *         description: Danh sách countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       500:
 *         description: Internal Server Error
 */
router.get('/countries', CountriesController.getAllCountries);          // GET /api/countries

/**
 * @openapi
 * /api/countries/{id}:
 *   get:
 *     summary: Lấy thông tin country theo id
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của country
 *     responses:
 *       200:
 *         description: Thông tin country
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
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
 *     summary: Tạo mới một country
 *     tags:
 *       - Countries
 *     requestBody:
 *       description: Dữ liệu country cần tạo (id không cần thiết)
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
 *     responses:
 *       201:
 *         description: Country được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       500:
 *         description: Internal Server Error
 */
router.post('/countries', CountriesController.createCountry);          // POST /api/countries

/**
 * @openapi
 * /api/countries/{id}:
 *   put:
 *     summary: Cập nhật thông tin country theo id
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của country cần cập nhật
 *     requestBody:
 *       description: Dữ liệu country để cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Country'
 *     responses:
 *       200:
 *         description: Country được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
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
 *     summary: Xóa country theo id
 *     tags:
 *       - Countries
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của country cần xóa
 *     responses:
 *       200:
 *         description: Country được xóa thành công
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/countries/:id', CountriesController.deleteCountry);    // DELETE /api/countries/:id

/**
 * @openapi
 * /api/countries/import:
 *   post:
 *     summary: Import countries từ API-Football vào database
 *     tags:
 *       - Countries
 *     responses:
 *       200:
 *         description: Import thành công, trả về danh sách countries đã được thêm/cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       500:
 *         description: Internal Server Error
 */
router.post('/countries/import', CountriesController.importFromApiFootball); // POST /api/countries/import

export default router;