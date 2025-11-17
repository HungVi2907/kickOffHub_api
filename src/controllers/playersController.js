import { Op } from 'sequelize';
import axios from 'axios';
import Player from '../models/Player.js';
import sequelize from '../config/database.js';
import playerTeamLeagueSeasonController from './playerTeamLeagueSeasonController.js';

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

const parseApiInteger = (value) => {
	if (value === undefined || value === null || String(value).trim() === '') {
		return null;
	}
	const parsed = Number.parseInt(String(value).trim(), 10);
	return Number.isInteger(parsed) ? parsed : null;
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

	async getPopularPlayers(req, res) {
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
				where: { isPopular: true },
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
			return res.status(500).json({ error: 'Lỗi khi lấy danh sách cầu thủ phổ biến' });
		}
	},

	async importPlayersFromApiFootball(req, res) {
		try {
			const seasonValue = parsePositiveIntOrDefault(req.query.season, undefined);
			if (seasonValue === undefined) {
				return res.status(400).json({ error: 'season là bắt buộc' });
			}
			if (seasonValue === null) {
				return res.status(400).json({ error: 'season phải là số nguyên dương' });
			}

			const leagueValue = parsePositiveIntOrDefault(req.query.league, undefined);
			if (leagueValue === undefined) {
				return res.status(400).json({ error: 'league là bắt buộc' });
			}
			if (leagueValue === null) {
				return res.status(400).json({ error: 'league phải là số nguyên dương' });
			}

			const teamValue = parsePositiveIntOrDefault(req.query.team, undefined);
			if (teamValue === undefined) {
				return res.status(400).json({ error: 'team là bắt buộc' });
			}
			if (teamValue === null) {
				return res.status(400).json({ error: 'team phải là số nguyên dương' });
			}

			const pageNumber = parsePositiveIntOrDefault(req.query.page, 1);
			if (pageNumber === null) {
				return res.status(400).json({ error: 'page phải là số nguyên dương' });
			}

			const apiParams = { season: seasonValue, league: leagueValue, page: pageNumber };
			if (teamValue !== undefined) {
				apiParams.team = teamValue;
			}

			const response = await axios.get('https://v3.football.api-sports.io/players', {
				params: apiParams,
				headers: {
					'x-apisports-key': process.env.API_FOOTBALL_KEY,
					'x-rapidapi-host': 'v3.football.api-sports.io'
				}
			});

			const apiPlayers = Array.isArray(response.data.response) ? response.data.response : [];
			if (apiPlayers.length === 0) {
				return res.status(200).json({ imported: 0, message: 'Không có cầu thủ nào được tìm thấy' });
			}

			const playerEntries = apiPlayers
				.map((item) => {
					const player = item?.player;
					if (!player || !Number.isInteger(player.id)) {
						return null;
					}
					const stats = Array.isArray(item?.statistics) && item.statistics.length > 0 ? item.statistics[0] : null;
					const inferredTeamIdFromStats = parseApiInteger(stats?.team?.id);
					const resolvedTeamId = teamValue !== undefined ? teamValue : inferredTeamIdFromStats;

					const playerPayload = {
						id: player.id,
						name: normalizeStringField(player.name) ?? null,
						firstname: normalizeStringField(player.firstname) ?? null,
						lastname: normalizeStringField(player.lastname) ?? null,
						age: parseApiInteger(player.age),
						birth_date: player.birth?.date || null,
						birth_place: normalizeStringField(player.birth?.place) ?? null,
						birth_country: normalizeStringField(player.birth?.country) ?? null,
						nationality: normalizeStringField(player.nationality) ?? null,
						height: normalizeStringField(player.height) ?? null,
						weight: normalizeStringField(player.weight) ?? null,
						number: parseApiInteger(player.number ?? stats?.games?.number),
						position: normalizeStringField(player.position ?? stats?.games?.position) ?? null,
						photo: normalizeStringField(player.photo) ?? null
					};

					const mappingPayload = resolvedTeamId
						? {
							playerId: player.id,
							leagueId: leagueValue,
							teamId: resolvedTeamId,
							season: seasonValue
						}
						: null;

					return {
						playerPayload,
						mappingPayload
					};
				})
				.filter((entry) => entry && entry.playerPayload.name);

			if (playerEntries.length === 0) {
				return res.status(200).json({ imported: 0, message: 'Không có cầu thủ hợp lệ để lưu' });
			}

			const playerPayloads = playerEntries.map((entry) => entry.playerPayload);
			const mappingPayloads = playerEntries
				.map((entry) => entry.mappingPayload)
				.filter((payload) => payload !== null);

			await Player.bulkCreate(playerPayloads, {
				updateOnDuplicate: [
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
				]
			});

			let createdMappings = 0;
			const mappingErrors = [];
			for (const mappingPayload of mappingPayloads) {
				try {
					await playerTeamLeagueSeasonController.createMappingRecord(mappingPayload);
					createdMappings += 1;
				} catch (error) {
					mappingErrors.push({
						playerId: mappingPayload.playerId,
						reason: error?.message || 'Không xác định'
					});
				}
			}

			return res.status(200).json({
				imported: playerPayloads.length,
				mappingsInserted: createdMappings,
				mappingErrors,
				page: pageNumber,
				totalPages: response.data.paging?.total || null,
				season: seasonValue,
				league: leagueValue,
				team: teamValue ?? null
			});
		} catch (error) {
			if (error.response && error.response.data) {
				return res.status(error.response.status || 500).json({
					error: 'Lỗi từ API Football',
					details: error.response.data
				});
			}
			return res.status(500).json({ error: 'Lỗi khi import cầu thủ từ API Football', details: error.message });
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
