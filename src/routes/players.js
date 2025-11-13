import express from 'express';
import playersController from '../controllers/playersController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Định danh duy nhất của cầu thủ
 *         name:
 *           type: string
 *           description: Tên đầy đủ được hiển thị
 *         firstname:
 *           type: string
 *           description: Tên riêng (nếu có)
 *         lastname:
 *           type: string
 *           description: Họ (nếu có)
 *         age:
 *           type: integer
 *           format: int32
 *           description: Tuổi hiện tại
 *         birth_date:
 *           type: string
 *           format: date
 *           description: Ngày sinh theo chuẩn ISO 8601 (YYYY-MM-DD)
 *         birth_place:
 *           type: string
 *           description: Nơi sinh
 *         birth_country:
 *           type: string
 *           description: Quốc gia nơi sinh
 *         nationality:
 *           type: string
 *           description: Quốc tịch thi đấu
 *         height:
 *           type: string
 *           description: Chiều cao dạng chuỗi (ví dụ "180 cm")
 *         weight:
 *           type: string
 *           description: Cân nặng dạng chuỗi (ví dụ "75 kg")
 *         number:
 *           type: integer
 *           format: int32
 *           description: Số áo thi đấu hiện tại
 *         position:
 *           type: string
 *           description: Vị trí sở trường
 *         photo:
 *           type: string
 *           format: uri
 *           description: Ảnh đại diện (URL)
 *       required:
 *         - id
 *         - name
 *       example:
 *         id: 394
 *         name: "Lionel Andrés Messi"
 *         firstname: "Lionel"
 *         lastname: "Messi"
 *         age: 36
 *         birth_date: "1987-06-24"
 *         birth_place: "Rosario"
 *         birth_country: "Argentina"
 *         nationality: "Argentina"
 *         height: "170 cm"
 *         weight: "72 kg"
 *         number: 10
 *         position: "Forward"
 *         photo: "https://example.com/messi.png"
 */

/**
 * @openapi
 * /api/players:
 *   get:
 *     summary: Lấy danh sách cầu thủ kèm phân trang
 *     description: Trả về danh sách cầu thủ, sắp xếp theo tên. Người dùng có thể điều chỉnh trang và kích thước trang qua query string.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Trang hiện tại (tính từ 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Số bản ghi mỗi trang.
 *     responses:
 *       200:
 *         description: Danh sách cầu thủ và thông tin phân trang.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
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
 *                 - id: 394
 *                   name: "Lionel Andrés Messi"
 *                   position: "Forward"
 *                   number: 10
 *                   nationality: "Argentina"
 *               pagination:
 *                 totalItems: 1200
 *                 totalPages: 60
 *                 page: 1
 *                 limit: 20
 *       400:
 *         description: Tham số phân trang không hợp lệ (ví dụ page <= 0).
 *         content:
 *           application/json:
 *             example:
 *               error: "Giá trị page phải là số nguyên dương"
 *       500:
 *         description: Lỗi hệ thống khi truy vấn dữ liệu.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi lấy danh sách cầu thủ"
 */
router.get('/players', playersController.getAllPlayers);

/**
 * @openapi
 * /api/players/search:
 *   get:
 *     summary: Tìm cầu thủ theo tên hiển thị
 *     description: Cho phép tìm theo từ khóa một phần, không phân biệt chữ hoa thường. Trả về tối đa 100 bản ghi.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa cần tìm (ít nhất 1 ký tự).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Số kết quả tối đa trả về.
 *     responses:
 *       200:
 *         description: Danh sách kết quả phù hợp với từ khóa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 keyword:
 *                   type: string
 *             example:
 *               results:
 *                 - id: 448
 *                   name: "Cristiano Ronaldo"
 *                   nationality: "Portugal"
 *               total: 1
 *               limit: 20
 *               keyword: "ronaldo"
 *       400:
 *         description: Thiếu tham số name hoặc limit không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               error: "Tham số name là bắt buộc"
 *       500:
 *         description: Lỗi hệ thống khi tìm kiếm.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi tìm kiếm cầu thủ"
 */
router.get('/players/search', playersController.searchPlayersByName);

/**
 * @openapi
 * /api/players/{id}:
 *   get:
 *     summary: Lấy chi tiết một cầu thủ
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID cầu thủ.
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của cầu thủ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: ID không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               error: "ID cầu thủ không hợp lệ"
 *       404:
 *         description: Không tìm thấy cầu thủ.
 *         content:
 *           application/json:
 *             example:
 *               error: "Không tìm thấy cầu thủ"
 *       500:
 *         description: Lỗi hệ thống.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi lấy thông tin cầu thủ"
 */
router.get('/players/:id', playersController.getPlayerById);

router.get('/players-stats', playersController.getPlayerStatsWithFilters);

/**
 * @openapi
 * /api/players:
 *   post:
 *     summary: Thêm mới một cầu thủ
 *     description: Trả về bản ghi cầu thủ vừa tạo. ID và name là bắt buộc.
 *     tags:
 *       - Players
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Player'
 *           example:
 *             id: 501
 *             name: "Nguyễn Văn A"
 *             nationality: "Vietnam"
 *             position: "Midfielder"
 *     responses:
 *       201:
 *         description: Tạo thành công cầu thủ mới.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Thiếu dữ liệu bắt buộc hoặc ID không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               error: "ID cầu thủ bắt buộc và phải là số nguyên dương"
 *       409:
 *         description: ID đã tồn tại trong hệ thống.
 *         content:
 *           application/json:
 *             example:
 *               error: "Cầu thủ đã tồn tại"
 *       500:
 *         description: Lỗi hệ thống khi lưu dữ liệu.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi tạo cầu thủ mới"
 */
router.post('/players', playersController.createPlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   put:
 *     summary: Cập nhật thông tin cầu thủ
 *     description: Cho phép cập nhật một phần dữ liệu. Không hỗ trợ thay đổi ID.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID cầu thủ cần cập nhật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               position:
 *                 type: string
 *               number:
 *                 type: integer
 *           example:
 *             name: "Nguyễn Văn A"
 *             number: 8
 *             position: "Midfielder"
 *     responses:
 *       200:
 *         description: Bản ghi cầu thủ sau khi cập nhật.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Dữ liệu cập nhật không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               error: "Không có dữ liệu để cập nhật"
 *       404:
 *         description: Không tìm thấy cầu thủ.
 *         content:
 *           application/json:
 *             example:
 *               error: "Không tìm thấy cầu thủ để cập nhật"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật dữ liệu.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi cập nhật cầu thủ"
 */
router.put('/players/:id', playersController.updatePlayer);

/**
 * @openapi
 * /api/players/{id}:
 *   delete:
 *     summary: Xóa cầu thủ khỏi hệ thống
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID cầu thủ cần xóa.
 *     responses:
 *       204:
 *         description: Xóa thành công, không trả về nội dung.
 *       400:
 *         description: ID không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               error: "ID cầu thủ không hợp lệ"
 *       404:
 *         description: Không tìm thấy cầu thủ để xóa.
 *         content:
 *           application/json:
 *             example:
 *               error: "Không tìm thấy cầu thủ để xóa"
 *       500:
 *         description: Lỗi hệ thống khi xóa dữ liệu.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lỗi khi xóa cầu thủ"
 */
router.delete('/players/:id', playersController.deletePlayer);

/**
 * @openapi
 * /api/players-stats:
 *   get:
 *     summary: Lấy thông tin thống kê cầu thủ từ API Football
 *     description: |
 *       Truy vấn thông tin chi tiết và thống kê cầu thủ từ API Football (api-sports.io)
 *       dựa trên các bộ lọc: playerid, teamid, leagueid, season.
 *       
 *       **Ví dụ URL:**
 *       - `/players-stats?playerid=874&season=2021&leagueid=39&teamid=33`
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: playerid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của cầu thủ (bắt buộc)
 *       - in: query
 *         name: season
 *         required: false
 *         schema:
 *           type: integer
 *         description: Mùa giải (ví dụ 2021, 2022)
 *       - in: query
 *         name: leagueid
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID của giải đấu (ví dụ 39 = Premier League)
 *       - in: query
 *         name: teamid
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID của đội bóng
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Dữ liệu từ API Football (response gốc từ api-sports.io)
 *       400:
 *         description: Tham số playerid không được cung cấp
 *         content:
 *           application/json:
 *             example:
 *               error: "playerid là bắt buộc"
 *       504:
 *         description: Hết timeout khi kết nối tới API Football
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Hết timeout khi kết nối tới API Football"
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Lỗi khi lấy thông tin thống kê cầu thủ"
 *               details: "Error details"
 */
router.get('/players-stats', playersController.getPlayerStatsWithFilters);



export default router;
