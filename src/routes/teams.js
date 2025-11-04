import express from 'express';
import teamsController from '../controllers/teamsController.js';

const router = express.Router();
// Định tuyến cho Teams

/**
 * @openapi
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *         name:
 *           type: string
 *         leagues_id:
 *           type: integer
 *         code:
 *           type: string
 *         country:
 *           type: string
 *         founded:
 *           type: integer
 *         national:
 *           type: boolean
 *         logo:
 *           type: string
 *         venue_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 */

/**
 * @openapi
 * /api/teams:
 *   get:
 *     summary: Lấy danh sách tất cả teams
 *     tags:
 *       - Teams
 *     responses:
 *       200:
 *         description: Danh sách teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */
router.get('/teams', teamsController.getAllTeams);          // GET /api/teams

/**
 * @openapi
 * /api/teams/league/{leagueID}:
 *   get:
 *     summary: Lấy teams theo league ID
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: leagueID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của league
 *     responses:
 *       200:
 *         description: Danh sách teams thuộc league
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */
router.get('/league/:leagueID', teamsController.getTeamsByLeague); // GET /api/teams/league/:leagueID

/**
 * @openapi
 * /api/teams/{teamId}/stats:
 *   get:
 *     summary: Lấy thống kê của team theo teamId và season (params, query tùy controller)
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của team
 *     responses:
 *       200:
 *         description: Thống kê của team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal Server Error
 */
router.get('/:teamId/stats', teamsController.getStatsByTeamIdAndSeason); // GET /api/teams/:teamId/stats

/**
 * @openapi
 * /api/teams/{name}/search:
 *   get:
 *     summary: Tìm teams theo tên
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên team hoặc phần tên để tìm
 *     responses:
 *       200:
 *         description: Danh sách teams phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */
router.get('/:name/search', teamsController.searchTeamsByName); // GET /api/teams/:name/search

/**
 * @openapi
 * /api/teams:
 *   post:
 *     summary: Tạo mới một team
 *     tags:
 *       - Teams
 *     requestBody:
 *       description: Dữ liệu team cần tạo
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
 *               country:
 *                 type: string
 *               founded:
 *                 type: integer
 *               national:
 *                 type: boolean
 *               logo:
 *                 type: string
 *               venue_id:
 *                 type: integer
 *               leagues_id:
 *                 type: integer
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Team được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */
router.post('/', teamsController.createTeam);          // POST /api/teams

/**
 * @openapi
 * /api/teams/{id}:
 *   put:
 *     summary: Cập nhật thông tin team theo id
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của team cần cập nhật
 *     requestBody:
 *       description: Dữ liệu team để cập nhật
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Team được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', teamsController.updateTeam);       // PUT /api/teams/:id

/**
 * @openapi
 * /api/teams/{id}:
 *   delete:
 *     summary: Xóa team theo id
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của team cần xóa
 *     responses:
 *       200:
 *         description: Team được xóa thành công
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', teamsController.deleteTeam);    // DELETE /api/teams/:id

/**
 * @openapi
 * /api/teams/import:
 *   post:
 *     summary: Import teams từ league vào database
 *     tags:
 *       - Teams
 *     responses:
 *       200:
 *         description: Import thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Internal Server Error
 */
router.post('/import', teamsController.importTeamsFromLeague); // POST /api/teams/import-from-league

/**
 * @openapi
 * /api/teams/{id}:
 *   get:
 *     summary: Lấy thông tin team theo id
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của team
 *     responses:
 *       200:
 *         description: Thông tin team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', teamsController.getTeamById);     // GET /api/teams/:id

export default router;