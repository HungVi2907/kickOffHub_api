import express from 'express';
import playerTeamLeagueSeasonController from '../controllers/playerTeamLeagueSeasonController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PlayerTeamLeagueSeason:
 *       type: object
 *       properties:
 *         playerId:
 *           type: integer
 *           format: int32
 *           description: ID cầu thủ trong bảng players.
 *         leagueId:
 *           type: integer
 *           format: int32
 *           description: ID giải đấu.
 *         teamId:
 *           type: integer
 *           format: int32
 *           description: ID đội bóng.
 *         season:
 *           type: integer
 *           format: int32
 *           description: Mùa giải (ví dụ 2024).
 *       required:
 *         - playerId
 *         - leagueId
 *         - teamId
 *         - season
 *       example:
 *         playerId: 394
 *         leagueId: 39
 *         teamId: 33
 *         season: 2024
 *     PlayerTeamLeagueSeasonWithPlayer:
 *       type: object
 *       properties:
 *         playerId:
 *           type: integer
 *         leagueId:
 *           type: integer
 *         teamId:
 *           type: integer
 *         season:
 *           type: integer
 *         player:
 *           allOf:
 *             - $ref: '#/components/schemas/Player'
 */

/**
 * @openapi
 * /api/player-team-league-season:
 *   post:
 *     summary: Tạo bản ghi cầu thủ-đội-giải-mùa
 *     description: Thêm hoặc cập nhật (upsert) mối quan hệ cầu thủ - đội - giải - mùa. Nếu bản ghi đã tồn tại, dữ liệu sẽ được cập nhật.
 *     tags:
 *       - Player-Team-League-Season
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerTeamLeagueSeason'
 *           example:
 *             playerId: 394
 *             leagueId: 39
 *             teamId: 33
 *             season: 2024
 *     responses:
 *       201:
 *         description: Tạo hoặc cập nhật thành công bản ghi.
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/PlayerTeamLeagueSeason'
 *       400:
 *         description: Dữ liệu không hợp lệ.
 *       409:
 *         description: Tham chiếu ngoại không tồn tại.
 *       500:
 *         description: Lỗi hệ thống.
 */
router.post('/player-team-league-season', playerTeamLeagueSeasonController.createMapping);

/**
 * @openapi
 * /api/player-team-league-season/players:
 *   get:
 *     summary: Danh sách cầu thủ của một đội trong một giải và mùa cụ thể
 *     description: Trả về danh sách cầu thủ thuộc đội (teamId) đang thi đấu ở giải (leagueId) trong mùa (season). Kết quả bao gồm thông tin chi tiết của cầu thủ.
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: query
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID giải đấu.
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID đội bóng.
 *       - in: query
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Mùa giải (ví dụ 2024).
 *     responses:
 *       200:
 *         description: Danh sách cầu thủ phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 total:
 *                   type: integer
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlayerTeamLeagueSeasonWithPlayer'
 *             example:
 *               filters:
 *                 leagueId: 39
 *                 teamId: 33
 *                 season: 2024
 *               total: 2
 *               players:
 *                 - playerId: 394
 *                   leagueId: 39
 *                   teamId: 33
 *                   season: 2024
 *                   player:
 *                     id: 394
 *                     name: "Lionel Andrés Messi"
 *                     position: "Forward"
 *                     number: 10
 *                     nationality: "Argentina"
 *       400:
 *         description: Thiếu hoặc sai định dạng tham số.
 *         content:
 *           application/json:
 *             example:
 *               error: "Thiếu thông tin bắt buộc: leagueId"
 *       500:
 *         description: Lỗi hệ thống.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi tìm cầu thủ theo đội và giải đấu"
 */
router.get('/player-team-league-season/players', playerTeamLeagueSeasonController.findPlayersByTeamLeagueSeason);

/**
 * @openapi
 * /api/player-team-league-season/{playerId}/{leagueId}/{teamId}/{season}:
 *   put:
 *     summary: Cập nhật bản ghi cầu thủ-đội-giải-mùa
 *     description: Cho phép cập nhật từng phần (ví dụ đổi teamId hoặc season). Nếu muốn đổi sang thông tin đã tồn tại thì hệ thống sẽ báo trùng để tránh trùng lặp dữ liệu.
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: season
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
 *               playerId:
 *                 type: integer
 *               leagueId:
 *                 type: integer
 *               teamId:
 *                 type: integer
 *               season:
 *                 type: integer
 *           example:
 *             teamId: 55
 *             season: 2025
 *     responses:
 *       200:
 *         description: Bản ghi sau khi cập nhật.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerTeamLeagueSeason'
 *       400:
 *         description: Dữ liệu cập nhật không hợp lệ.
 *       404:
 *         description: Không tìm thấy bản ghi để cập nhật.
 *       409:
 *         description: Dữ liệu mới bị trùng hoặc tham chiếu ngoại không hợp lệ.
 *       500:
 *         description: Lỗi hệ thống.
 */
router.put('/player-team-league-season/:playerId/:leagueId/:teamId/:season', playerTeamLeagueSeasonController.updateMapping);

/**
 * @openapi
 * /api/player-team-league-season/{playerId}/{leagueId}/{teamId}/{season}:
 *   delete:
 *     summary: Xóa một bản ghi cầu thủ-đội-giải-mùa
 *     tags:
 *       - Player-Team-League-Season
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Xóa thành công, không có nội dung trả về.
 *       400:
 *         description: Tham số không hợp lệ.
 *       404:
 *         description: Không tìm thấy bản ghi để xóa.
 *       500:
 *         description: Lỗi hệ thống.
 */
router.delete('/player-team-league-season/:playerId/:leagueId/:teamId/:season', playerTeamLeagueSeasonController.deleteMapping);


export default router;
