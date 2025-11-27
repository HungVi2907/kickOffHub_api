import { Op } from 'sequelize';
import axios from 'axios';
import Team from '../models/Team.js';
import LeagueTeamSeason from '../models/LeagueTeamSeason.js';

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

const parseRequiredPositiveInt = (value, fieldName) => {
	if (value === undefined || value === null || String(value).trim() === '') {
		throw new Error(`MISSING_${fieldName}`);
	}
	const parsed = parsePositiveIntOrDefault(value, null);
	if (parsed === null) {
		throw new Error(`INVALID_${fieldName}`);
	}
	return parsed;
};

const normalizeStringField = (value) => {
	if (value === undefined || value === null) {
		return null;
	}
	const trimmed = String(value).trim();
	return trimmed === '' ? null : trimmed;
};

const parseApiInteger = (value) => {
	if (value === undefined || value === null) {
		return null;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') {
		return null;
	}
	const parsed = Number.parseInt(trimmed, 10);
	return Number.isInteger(parsed) ? parsed : null;
};

const buildTeamPayloadFromApi = (entry) => {
	const team = entry?.team;
	if (!team) {
		return null;
	}
	const teamId = parseApiInteger(team.id);
	if (!teamId) {
		return null;
	}
	const payload = {
		id: teamId,
		name: normalizeStringField(team.name),
		code: normalizeStringField(team.code),
		country: normalizeStringField(team.country),
		founded: parseApiInteger(team.founded),
		national: Boolean(team.national),
		logo: normalizeStringField(team.logo),
		venue_id: parseApiInteger(entry?.venue?.id)
	};
	if (!payload.name) {
		return null;
	}
	return payload;
};

const readRequestValue = (req, key) => {
	if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
		return req.body[key];
	}
	return req.query ? req.query[key] : undefined;
};
const TeamsController = {
	async getAllTeams(req, res) {
		try {
			const { page, limit } = req.query;

			const pageNumber = parsePositiveIntOrDefault(page, 1);
			if (pageNumber === null) {
				return res.status(400).json({ error: 'Giá trị page phải là số nguyên dương' });
			}

			const limitNumber = parsePositiveIntOrDefault(limit, 20);
			if (limitNumber === null) {
				return res.status(400).json({ error: 'Giá trị limit phải là số nguyên dương' });
			}

			const offset = (pageNumber - 1) * limitNumber;

			const { rows, count } = await Team.findAndCountAll({
				attributes: ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'],
				order: [['name', 'ASC']],
				limit: limitNumber,
				offset
			});

			const totalPages = Math.ceil(count / limitNumber);

			res.json({
				data: rows,
				pagination: {
					totalItems: count,
					totalPages,
					page: pageNumber,
					limit: limitNumber
				}
			});
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi lấy danh sách teams' });
		}
	},

	async getTeamById(req, res) {
		try {
			const { id } = req.params;
			const teamId = Number.parseInt(id, 10);
			if (!Number.isInteger(teamId) || teamId <= 0) {
				return res.status(400).json({ error: 'ID team không hợp lệ' });
			}
			const team = await Team.findByPk(teamId,
				{ attributes: ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'] }
			);
			if (!team) {
				return res.status(404).json({ error: 'Team không tồn tại' });
			}
			res.json(team);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi lấy thông tin team' });
		}
	},

	async getTeamsByLeague(req, res) {
		try {
			const rawLeagueId = req.params.leagueID;
			const leagueId = Number.parseInt(rawLeagueId, 10);
			if (!Number.isInteger(leagueId) || leagueId <= 0) {
				return res.status(400).json({ error: 'leagueID không hợp lệ' });
			}

			const { season } = req.query;
			let parsedSeason;
			if (season !== undefined) {
				const trimmed = String(season).trim();
				if (trimmed !== '') {
					const seasonNumber = Number.parseInt(trimmed, 10);
					if (!Number.isInteger(seasonNumber) || seasonNumber <= 0) {
						return res.status(400).json({ error: 'season không hợp lệ' });
					}
					parsedSeason = seasonNumber;
				}
			}

			const pivotWhere = { leagueId };
			if (parsedSeason !== undefined) {
				pivotWhere.season = parsedSeason;
			}

			const mappings = await LeagueTeamSeason.findAll({
				where: pivotWhere,
				attributes: ['teamId']
			});

			if (mappings.length === 0) {
				return res.status(404).json({ error: 'Không tìm thấy đội bóng cho leagueID đã cung cấp' });
			}

			const teamIds = [...new Set(mappings.map((entry) => entry.teamId))];
			const teams = await Team.findAll({
				attributes: ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'],
				where: { id: { [Op.in]: teamIds } },
				order: [['name', 'ASC']]
			});

			if (teams.length === 0) {
				return res.status(404).json({ error: 'Không tìm thấy đội bóng trong cơ sở dữ liệu cho leagueID này' });
			}

			res.json(teams);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi lấy teams theo league' });
		}
	},

	async createTeam(req, res) {
		try {
			// Accept only known fields and coerce numeric inputs when needed
			const payload = {
				name: req.body.name,
				code: req.body.code ?? null,
				country: req.body.country ?? null,
				founded: req.body.founded ? Number(req.body.founded) : null,
				national: req.body.national ?? false,
				logo: req.body.logo ?? null,
				venue_id: req.body.venue_id ? Number(req.body.venue_id) : null
			};

			const team = await Team.create(payload);
			res.status(201).json(team);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi tạo team mới' });
		}
	},

	async updateTeam(req, res) {
		try {
			const { id } = req.params;
			const teamId = Number.parseInt(id, 10);
			if (!Number.isInteger(teamId) || teamId <= 0) {
				return res.status(400).json({ error: 'ID team không hợp lệ' });
			}
			// Build update payload safely
			const updatePayload = {};
			const fields = ['name','code','country','founded','national','logo','venue_id'];
			for (const f of fields) {
				if (Object.prototype.hasOwnProperty.call(req.body, f)) {
					if (f === 'founded' || f === 'venue_id') {
						updatePayload[f] = req.body[f] !== null ? Number(req.body[f]) : null;
					} else {
						updatePayload[f] = req.body[f];
					}
				}
			}

			const [updatedRows] = await Team.update(updatePayload, { where: { id: teamId } });
			if (updatedRows === 0) {
				return res.status(404).json({ error: 'Team không tồn tại' });
			}
			const updatedTeam = await Team.findByPk(teamId);
			res.json(updatedTeam);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi cập nhật team' });
		}
	},

	async deleteTeam(req, res) {
		try {
			const { id } = req.params;
			const teamId = Number.parseInt(id, 10);
			if (!Number.isInteger(teamId) || teamId <= 0) {
				return res.status(400).json({ error: 'ID team không hợp lệ' });
			}
			const deletedRows = await Team.destroy({ where: { id: teamId } });
			if (deletedRows === 0) {
				return res.status(404).json({ error: 'Team không tồn tại' });
			}
			res.json({ message: 'Team đã được xóa thành công' });
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi xóa team' });
		}
	},

	async searchTeamsByName(req, res) {
		try {
			const rawName = req.query.name;
			const keyword = typeof rawName === 'string' ? rawName.trim() : '';

			if (!keyword) {
				return res.status(400).json({ error: 'Tên đội bóng không hợp lệ' });
			}

			const rawLimit = req.query.limit;
			let limit = 20;
			if (rawLimit !== undefined) {
				const trimmedLimit = String(rawLimit).trim();
				if (trimmedLimit !== '') {
					const parsedLimit = Number.parseInt(trimmedLimit, 10);
					if (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
						return res.status(400).json({ error: 'Giá trị limit không hợp lệ (1-100)' });
					}
					limit = parsedLimit;
				}
			}

			const escapedKeyword = keyword.replace(/[%_]/g, '\\$&');
			const teams = await Team.findAll({
				where: {
					name: {
						[Op.like]: `%${escapedKeyword}%`
					}
				},
				order: [['name', 'ASC']],
				limit
			});

			res.json({
				results: teams,
				total: teams.length,
				limit,
				keyword
			});
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi tìm kiếm team', details: error.message });
		}
	},

	async importTeamsFromApiFootball(req, res) {
		try {
			const seasonValue = parseRequiredPositiveInt(readRequestValue(req, 'season'), 'season');
			const leagueValue = parseRequiredPositiveInt(readRequestValue(req, 'league'), 'league');

			const apiParams = {
				league: leagueValue,
				season: seasonValue
			};

			const response = await axios.get('https://v3.football.api-sports.io/teams', {
				params: apiParams,
				headers: {
					'x-apisports-key': process.env.API_FOOTBALL_KEY,
					'x-rapidapi-host': 'v3.football.api-sports.io'
				}
			});

			const apiTeams = Array.isArray(response.data?.response) ? response.data.response : [];
			if (apiTeams.length === 0) {
				return res.status(200).json({
					imported: 0,
					mappingsInserted: 0,
					mappingErrors: [],
					season: seasonValue,
					league: leagueValue,
					totalPages: response.data?.paging?.total ?? null,
					message: 'Không có đội bóng nào được trả về từ API-Football'
				});
			}

			const teamPayloads = apiTeams
				.map((entry) => buildTeamPayloadFromApi(entry))
				.filter((payload) => payload !== null);

			if (teamPayloads.length === 0) {
				return res.status(200).json({
					imported: 0,
					mappingsInserted: 0,
					mappingErrors: [],
					season: seasonValue,
					league: leagueValue,
					totalPages: response.data?.paging?.total ?? null,
					message: 'Không có đội bóng hợp lệ để lưu'
				});
			}

			await Team.bulkCreate(teamPayloads, {
				updateOnDuplicate: ['name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id']
			});

			const uniqueTeamIds = [...new Set(teamPayloads.map((payload) => payload.id))];
			const mappingPayloads = uniqueTeamIds.map((teamId) => ({
				leagueId: leagueValue,
				teamId,
				season: seasonValue
			}));

			let mappingsInserted = 0;
			const mappingErrors = [];
			for (const payload of mappingPayloads) {
				try {
					await LeagueTeamSeason.upsert(payload);
					mappingsInserted += 1;
				} catch (error) {
					mappingErrors.push({
						teamId: payload.teamId,
						reason: error?.message || 'Không xác định'
					});
				}
			}

			return res.status(200).json({
				imported: teamPayloads.length,
				mappingsInserted,
				mappingErrors,
				season: seasonValue,
				league: leagueValue,
				totalPages: response.data?.paging?.total ?? null
			});
		} catch (error) {
			if (error?.message?.startsWith('MISSING_')) {
				const field = error.message.replace('MISSING_', '');
				return res.status(400).json({ error: `${field} là bắt buộc` });
			}
			if (error?.message?.startsWith('INVALID_')) {
				const field = error.message.replace('INVALID_', '');
				return res.status(400).json({ error: `${field} phải là số nguyên dương hợp lệ` });
			}
			if (error.response && error.response.data) {
				return res.status(error.response.status || 500).json({
					error: 'Lỗi từ API Football',
					details: error.response.data
				});
			}
			if (error.code === 'ECONNABORTED') {
				return res.status(504).json({ error: 'Hết thời gian chờ khi gọi API-Football' });
			}
			return res.status(500).json({ error: 'Lỗi khi import teams từ API Football', details: error.message });
		}
	},

	async getPopularTeams(req, res) {
		try {
			const { page, limit } = req.query;

			const pageNumber = parsePositiveIntOrDefault(page, 1);
			if (pageNumber === null) {
				return res.status(400).json({ error: 'Giá trị page phải là số nguyên dương' });
			}

			const limitNumber = parsePositiveIntOrDefault(limit, 20);
			if (limitNumber === null) {
				return res.status(400).json({ error: 'Giá trị limit phải là số nguyên dương' });
			}

			const offset = (pageNumber - 1) * limitNumber;

			const { rows, count } = await Team.findAndCountAll({
				where: { isPopular: true },
				attributes: ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'],
				order: [['name', 'ASC']],
				limit: limitNumber,
				offset
			});

			const totalPages = Math.ceil(count / limitNumber);

			res.json({
				data: rows,
				pagination: {
					totalItems: count,
					totalPages,
					page: pageNumber,
					limit: limitNumber
				}
			});
		} catch (error) {
			console.error('Error in getPopularTeams:', error);
			res.status(500).json({ error: 'Lỗi khi lấy danh sách teams phổ biến', details: error.message });
		}
	},

	async getStatsByTeamIdAndSeasonAndLeague(req, res) {
		try {
			const rawTeamId = req.params.teamId ?? req.params.id ?? req.query.teamId;
			const rawLeagueId = req.params.leagueId ?? req.params.leagues_id ?? req.query.league;
			const rawSeason = req.params.season ?? req.query.season;

			const teamId = Number(rawTeamId);
			if (!Number.isFinite(teamId) || teamId <= 0) {
				return res.status(400).json({ error: 'teamId không hợp lệ' });
			}

			const leagueId = Number(rawLeagueId);
			if (!Number.isFinite(leagueId) || leagueId <= 0) {
				return res.status(400).json({ error: 'leagueId không hợp lệ' });
			}

			const season = Number(rawSeason);
			if (!Number.isFinite(season) || season <= 0) {
				return res.status(400).json({ error: 'season không hợp lệ' });
			}

			const queryParams = new URLSearchParams({ league: String(leagueId), team: String(teamId), season: String(season) });
			const response = await fetch(`https://v3.football.api-sports.io/teams/statistics?${queryParams.toString()}`, {
				headers: {
					"x-apisports-key": process.env.API_FOOTBALL_KEY,
					"x-rapidapi-host": "v3.football.api-sports.io"
				}
			});

			if (!response.ok) {
				const errorPayload = await response.json().catch(() => ({}));
				return res.status(response.status).json({
					error: 'Không thể lấy thống kê đội bóng từ API-Football',
					status: response.status,
					details: errorPayload
				});
			}

			const data = await response.json();
			res.json({
				league: leagueId,
				leagueId,
				season,
				teamId,
				source: 'API-Football',
				payload: data
			});
		} catch (error) {
			console.error('Lỗi khi lấy thống kê đội bóng:', error);
			res.status(500).json({ error: 'Lỗi khi lấy thống kê đội bóng' });
		}
	}
};

export default TeamsController;
