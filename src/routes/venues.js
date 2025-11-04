import express from 'express';
import venuesController from '../controllers/venuesController.js';

const router = express.Router();
// Định tuyến cho Venues

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
 *     summary: Lấy danh sách tất cả venues
 *     tags:
 *       - Venues
 *     responses:
 *       200:
 *         description: Danh sách venues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venue'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', venuesController.getAllVenues);          // GET /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   get:
 *     summary: Lấy thông tin venue theo id
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của venue
 *     responses:
 *       200:
 *         description: Thông tin venue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', venuesController.getVenueById);      // GET /api/venues/:id

/**
 * @openapi
 * /api/venues:
 *   post:
 *     summary: Tạo mới một venue
 *     tags:
 *       - Venues
 *     requestBody:
 *       description: Dữ liệu venue cần tạo
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
 *       201:
 *         description: Venue được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       500:
 *         description: Internal Server Error
 */
router.post('/', venuesController.createVenue);          // POST /api/venues

/**
 * @openapi
 * /api/venues/{id}:
 *   put:
 *     summary: Cập nhật thông tin venue theo id
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của venue cần cập nhật
 *     requestBody:
 *       description: Dữ liệu venue để cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venue'
 *     responses:
 *       200:
 *         description: Venue được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', venuesController.updateVenue);       // PUT /api/venues/:id

/**
 * @openapi
 * /api/venues/{id}:
 *   delete:
 *     summary: Xóa venue theo id
 *     tags:
 *       - Venues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của venue cần xóa
 *     responses:
 *       200:
 *         description: Venue được xóa thành công
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', venuesController.deleteVenue);    // DELETE /api/venues/:id

/**
 * @openapi
 * /api/venues/import:
 *   post:
 *     summary: Import venues từ league vào database
 *     tags:
 *       - Venues
 *     responses:
 *       200:
 *         description: Import thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venue'
 *       500:
 *         description: Internal Server Error
 */
router.post('/import', venuesController.importVenuesFromLeague); // POST /api/venues/import-from-league
export default router;