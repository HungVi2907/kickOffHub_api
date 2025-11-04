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
 *         id:
 *           type: integer
 *           format: int32
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         logo:
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

// Định tuyến cho Leagues

/**
 * @openapi
 * /api/leagues:
 *   get:
 *     summary: Lấy danh sách tất cả leagues
 *     tags:
 *       - Leagues
 *     responses:
 *       200:
 *         description: Danh sách leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', LeaguesController.getAllLeagues);          // GET /api/leagues

/**
 * @openapi
 * /api/leagues/{id}:
 *   get:
 *     summary: Lấy thông tin league theo id
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của league
 *     responses:
 *       200:
 *         description: Thông tin league
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', LeaguesController.getLeagueById);      // GET /api/leagues/:id

/**
 * @openapi
 * /api/leagues:
 *   post:
 *     summary: Tạo mới một league
 *     tags:
 *       - Leagues
 *     requestBody:
 *       description: Dữ liệu league cần tạo
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
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: League được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       500:
 *         description: Internal Server Error
 */
router.post('/', LeaguesController.createLeague);          // POST /api/leagues

/**
 * @openapi
 * /api/leagues/{id}:
 *   put:
 *     summary: Cập nhật thông tin league theo id
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của league cần cập nhật
 *     requestBody:
 *       description: Dữ liệu league để cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/League'
 *     responses:
 *       200:
 *         description: League được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/League'
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', LeaguesController.updateLeague);       // PUT /api/leagues/:id

/**
 * @openapi
 * /api/leagues/{id}:
 *   delete:
 *     summary: Xóa league theo id
 *     tags:
 *       - Leagues
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID của league cần xóa
 *     responses:
 *       200:
 *         description: League được xóa thành công
 *       404:
 *         description: League not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', LeaguesController.deleteLeague);    // DELETE /api/leagues/:id

export default router;