import { Op } from 'sequelize';
import axios from 'axios';
import Player from '../models/Player.js';
import sequelize from '../config/database.js';

const parsePositiveIntOrDefault = (value, defaultValue) => {
	if (value === undefined || value === null) {
		return defaultValue;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') {
		return defaultValue;
	}
	const parsed = Number.parseInt(trimmed, 10);
	if (!Number.isInteger(parsed) || parsed < 1) {
		return null;
	}
	return parsed;
};

const validateId = (rawId) => {
	const parsed = Number.parseInt(rawId, 10);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		return null;
	}
	return parsed;
};

const allowedFields = [
	'name',
	'firstname',
	'lastname',
	'age',
	'birth_date',
	'birth_place',
	'birth_country',
	'nationality',
	'height',
	'weight',
	'number',
	'position',
	'photo'
];

const normalizeStringField = (value) => {
	if (value === undefined) {
		return undefined;
	}
	if (value === null) {
		return null;
	}
	const trimmed = String(value).trim();
	return trimmed === '' ? null : trimmed;
};

const parseOptionalIntegerField = (value, fieldName) => {
	if (value === undefined) {
		return undefined;
	}
	if (value === null || value === '') {
		return null;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') {
		return null;
	}
	const parsed = Number.parseInt(trimmed, 10);
	if (!Number.isInteger(parsed)) {
		throw new Error(`INVALID_INTEGER_${fieldName}`);
	}
	if (fieldName === 'age' && parsed <= 0) {
		throw new Error(`INVALID_INTEGER_${fieldName}`);
	}
	if (fieldName === 'number' && parsed <= 0) {
		throw new Error(`INVALID_INTEGER_${fieldName}`);
	}
	return parsed;
};

const buildPayload = (body) => {
	const payload = {};
	for (const field of allowedFields) {
		if (Object.prototype.hasOwnProperty.call(body, field)) {
			if (field === 'age' || field === 'number') {
				const parsed = parseOptionalIntegerField(body[field], field);
				if (parsed !== undefined) {
					payload[field] = parsed;
				}
			} else {
				const normalized = normalizeStringField(body[field]);
				if (normalized !== undefined) {
					payload[field] = normalized;
				}
			}
		}
	}
	return payload;
};

const PlayersController = {
	async getAllPlayers(req, res) {
		try {
			const pageNumber = parsePositiveIntOrDefault(req.query.page, 1);
			if (pageNumber === null) {
				return res.status(400).json({ error: 'Giá trị page phải là số nguyên dương' });
			}

			const limitNumber = parsePositiveIntOrDefault(req.query.limit, 20);
			if (limitNumber === null) {
				return res.status(400).json({ error: 'Giá trị limit phải là số nguyên dương' });
			}

			if (limitNumber > 100) {
				return res.status(400).json({ error: 'Giá trị limit không được vượt quá 100' });
			}

			const offset = (pageNumber - 1) * limitNumber;

			const { rows, count } = await Player.findAndCountAll({
				attributes: [
					'id',
					'name',
					'firstname',
					'lastname',
					'age',
					'birth_date',
					'birth_place',
					'birth_country',
					'nationality',
					'height',
					'weight',
					'number',
					'position',
					'photo'
				],
				order: [['name', 'ASC']],
				limit: limitNumber,
				offset
			});

			return res.json({
				data: rows,
				pagination: {
					totalItems: count,
					totalPages: Math.ceil(count / limitNumber),
					page: pageNumber,
					limit: limitNumber
				}
			});
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi lấy danh sách cầu thủ' });
		}
	},

	async getPlayerById(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'ID cầu thủ không hợp lệ' });
			}

			const player = await Player.findByPk(playerId);
			if (!player) {
				return res.status(404).json({ error: 'Không tìm thấy cầu thủ' });
			}

			return res.json(player);
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi lấy thông tin cầu thủ' });
		}
	},

	async searchPlayersByName(req, res) {
		try {
			const keywordRaw = typeof req.query.name === 'string' ? req.query.name.trim() : '';
			if (!keywordRaw) {
				return res.status(400).json({ error: 'Tham số name là bắt buộc' });
			}

			const limitValue = parsePositiveIntOrDefault(req.query.limit, 20);
			if (limitValue === null || limitValue > 100) {
				return res.status(400).json({ error: 'Giá trị limit phải nằm trong khoảng 1-100' });
			}

			const keywordLower = keywordRaw.toLowerCase();
			const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
			const likePattern = `%${escapedKeyword}%`;

			const players = await Player.findAll({
				where: sequelize.where(
					sequelize.fn('LOWER', sequelize.col('name')),
					{
						[Op.like]: likePattern
					}
				),
				order: [['name', 'ASC']],
				limit: limitValue
			});

			return res.json({
				results: players,
				total: players.length,
				limit: limitValue,
				keyword: keywordRaw
			});
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi tìm kiếm cầu thủ' });
		}
	},

	async createPlayer(req, res) {
		try {
			const playerId = validateId(req.body.id);
			if (!playerId) {
				return res.status(400).json({ error: 'ID cầu thủ bắt buộc và phải là số nguyên dương' });
			}

			const existing = await Player.findByPk(playerId);
			if (existing) {
				return res.status(409).json({ error: 'Cầu thủ đã tồn tại' });
			}

			let payload;
			try {
				payload = { id: playerId, ...buildPayload(req.body) };
			} catch (error) {
				if (error instanceof Error && error.message.startsWith('INVALID_INTEGER_')) {
					const field = error.message.replace('INVALID_INTEGER_', '');
					return res.status(400).json({ error: `Trường ${field} phải là số nguyên dương hợp lệ` });
				}
				return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
			}
			if (!payload.name) {
				return res.status(400).json({ error: 'Trường name là bắt buộc' });
			}

			const player = await Player.create(payload);
			return res.status(201).json(player);
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi tạo cầu thủ mới' });
		}
	},

	async updatePlayer(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'ID cầu thủ không hợp lệ' });
			}

			let updatePayload;
			try {
				updatePayload = buildPayload(req.body);
			} catch (error) {
				if (error instanceof Error && error.message.startsWith('INVALID_INTEGER_')) {
					const field = error.message.replace('INVALID_INTEGER_', '');
					return res.status(400).json({ error: `Trường ${field} phải là số nguyên dương hợp lệ` });
				}
				return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
			}
			if (Object.keys(updatePayload).length === 0) {
				return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
			}

			const [updatedRows] = await Player.update(updatePayload, { where: { id: playerId } });
			if (updatedRows === 0) {
				return res.status(404).json({ error: 'Không tìm thấy cầu thủ để cập nhật' });
			}

			const updatedPlayer = await Player.findByPk(playerId);
			return res.json(updatedPlayer);
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi cập nhật cầu thủ' });
		}
	},

	async deletePlayer(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'ID cầu thủ không hợp lệ' });
			}

			const deletedRows = await Player.destroy({ where: { id: playerId } });
			if (deletedRows === 0) {
				return res.status(404).json({ error: 'Không tìm thấy cầu thủ để xóa' });
			}

			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi xóa cầu thủ' });
		}
	},

	/**
	 * Lấy thông tin thống kê cầu thủ từ API Football
	 * Query params: playerid, teamid, leagueid, season
	 */
	async getPlayerStatsWithFilters(req, res) {
		try {
			const { playerid, teamid, leagueid, season } = req.query;

			// Validate các tham số
			if (!playerid) {
				return res.status(400).json({ error: 'playerid là bắt buộc' });
			}

			// Build URL động dựa trên các tham số được cung cấp
			let url = `https://v3.football.api-sports.io/players?id=${playerid}`;
			
			if (season) {
				url += `&season=${season}`;
			}
			if (leagueid) {
				url += `&league=${leagueid}`;
			}
			if (teamid) {
				url += `&team=${teamid}`;
			}

			// Gọi API Football
			const response = await axios.get(url, {
				headers: {
					'x-apisports-key': process.env.API_FOOTBALL_KEY,
					'x-rapidapi-host': 'v3.football.api-sports.io'
				}
			});

			// Trả về kết quả từ API
			return res.status(200).json({
				success: true,
				data: response.data
			});
		} catch (error) {
			// Xử lý lỗi từ API hoặc network
			if (error.response) {
				// API trả về lỗi
				return res.status(error.response.status).json({
					success: false,
					error: 'Lỗi từ API Football',
					details: error.response.data
				});
			} else if (error.code === 'ECONNABORTED') {
				return res.status(504).json({
					success: false,
					error: 'Hết timeout khi kết nối tới API Football'
				});
			} else {
				return res.status(500).json({
					success: false,
					error: 'Lỗi khi lấy thông tin thống kê cầu thủ',
					details: error.message
				});
			}
		}
	}
};

export default PlayersController;
