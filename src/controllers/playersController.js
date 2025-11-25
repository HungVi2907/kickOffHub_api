import { Op } from 'sequelize';
import axios from 'axios';
import Player from '../models/Player.js';
import sequelize from '../config/database.js';
import playerTeamLeagueSeasonController from './playerTeamLeagueSeasonController.js';
import Country from '../models/Country.js';

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

const PLAYER_ATTRIBUTES = [
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
];

const COUNTRY_ATTRIBUTES = ['id', 'name', 'code', 'flag'];

const MAX_PLAYER_LIMIT = 100;

const paginationErrorMessages = {
	INVALID_PAGE: 'Giá trị page phải là số nguyên dương',
	INVALID_LIMIT: 'Giá trị limit phải là số nguyên dương',
	LIMIT_TOO_LARGE: `Giá trị limit không được vượt quá ${MAX_PLAYER_LIMIT}`
};

const createPaginationError = (code) => {
	const error = new Error(code);
	error.code = code;
	return error;
};

const parsePaginationParams = (query, { defaultLimit = 20, maxLimit = MAX_PLAYER_LIMIT } = {}) => {
	const pageNumber = parsePositiveIntOrDefault(query.page, 1);
	if (pageNumber === null) {
		throw createPaginationError('INVALID_PAGE');
	}

	const limitNumber = parsePositiveIntOrDefault(query.limit, defaultLimit);
	if (limitNumber === null) {
		throw createPaginationError('INVALID_LIMIT');
	}

	if (limitNumber > maxLimit) {
		throw createPaginationError('LIMIT_TOO_LARGE');
	}

	return {
		pageNumber,
		limitNumber,
		offset: (pageNumber - 1) * limitNumber
	};
};

const queryParamErrorMessages = {
	REQUIRED_QUERY_PARAM: (field) => `${field} is required`,
	INVALID_QUERY_PARAM: (field) => `${field} must be a positive integer`
};

const createQueryParamError = (code, field) => {
	const error = new Error(code);
	error.code = code;
	error.field = field;
	return error;
};

const parseRequiredPositiveIntParam = (rawValue, field) => {
	const parsed = parsePositiveIntOrDefault(rawValue, undefined);
	if (parsed === undefined) {
		throw createQueryParamError('REQUIRED_QUERY_PARAM', field);
	}
	if (parsed === null) {
		throw createQueryParamError('INVALID_QUERY_PARAM', field);
	}
	return parsed;
};

const parseOptionalPositiveIntParam = (rawValue, field) => {
	const parsed = parsePositiveIntOrDefault(rawValue, undefined);
	if (parsed === undefined) {
		return undefined;
	}
	if (parsed === null) {
		throw createQueryParamError('INVALID_QUERY_PARAM', field);
	}
	return parsed;
};

const formatQueryParamErrorMessage = (error) => {
	const formatter = queryParamErrorMessages[error.code];
	return formatter ? formatter(error.field) : 'Tham số truy vấn không hợp lệ';
};

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

const fetchCountryByName = async (countryName) => {
	if (!countryName) {
		return null;
	}
	const normalized = countryName.trim();
	if (!normalized) {
		return null;
	}
	const country = await Country.findOne({
		attributes: COUNTRY_ATTRIBUTES,
		where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), normalized.toLowerCase())
	});
	return country;
};

class PlayersController {
	static async getAllPlayers(req, res) {
		try {
			let pagination;
			try {
				pagination = parsePaginationParams(req.query);
			} catch (paginationError) {
				const message = paginationErrorMessages[paginationError.code] || 'pagination parameters are invalid';
				return res.status(400).json({ error: message });
			}

			const { pageNumber, limitNumber, offset } = pagination;

			const { rows, count } = await Player.findAndCountAll({
				attributes: PLAYER_ATTRIBUTES,
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
			return res.status(500).json({ error: 'Error retrieving players list' });
		}
	}

	static async getPlayerById(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'Invalid player ID' });
			}

			const player = await Player.findByPk(playerId, { attributes: PLAYER_ATTRIBUTES });
			if (!player) {
				return res.status(404).json({ error: 'Player not found' });
			}

			const country = await fetchCountryByName(player.nationality ?? '');
			return res.json({
				...player.toJSON(),
				country: country ? country.toJSON() : null
			});
		} catch (error) {
			return res.status(500).json({ error: 'Error retrieving player information' });
		}
	}

	static async searchPlayersByName(req, res) {
		try {
			const keywordRaw = typeof req.query.name === 'string' ? req.query.name.trim() : '';
			if (!keywordRaw) {
				return res.status(400).json({ error: 'name parameter is required' });
			}

			const limitValue = parsePositiveIntOrDefault(req.query.limit, 20);
			if (limitValue === null || limitValue > 100) {
				return res.status(400).json({ error: 'Limit value must be between 1 and 100' });
			}

			const keywordLower = keywordRaw.toLowerCase();
			const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
			const likePattern = `%${escapedKeyword}%`;

			const players = await Player.findAll({
				attributes: PLAYER_ATTRIBUTES,
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
			return res.status(500).json({ error: 'Error searching for players' });
		}
	}

	static async createPlayer(req, res) {
		try {
			const playerId = validateId(req.body.id);
			if (!playerId) {
				return res.status(400).json({ error: 'Player ID is required and must be a positive integer' });
			}

			const existing = await Player.findByPk(playerId);
			if (existing) {
				return res.status(409).json({ error: 'Player already exists' });
			}

			let payload;
			try {
				payload = { id: playerId, ...buildPayload(req.body) };
			} catch (error) {
				if (error instanceof Error && error.message.startsWith('INVALID_INTEGER_')) {
					const field = error.message.replace('INVALID_INTEGER_', '');
					return res.status(400).json({ error: `Field ${field} must be a valid positive integer` });
				}
				return res.status(400).json({ error: 'Invalid data' });
			}
			if (!payload.name) {
				return res.status(400).json({ error: 'Field name is required' });
			}

			const player = await Player.create(payload);
			const persistedPlayer = await Player.findByPk(player.id, { attributes: PLAYER_ATTRIBUTES });
			return res.status(201).json(persistedPlayer);
		} catch (error) {
			return res.status(500).json({ error: 'Error creating new player' });
		}
	}

	static async updatePlayer(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'Invalid player ID' });
			}

			let updatePayload;
			try {
				updatePayload = buildPayload(req.body);
			} catch (error) {
				if (error instanceof Error && error.message.startsWith('INVALID_INTEGER_')) {
					const field = error.message.replace('INVALID_INTEGER_', '');
					return res.status(400).json({ error: `Field ${field} must be a valid positive integer` });
				}
				return res.status(400).json({ error: 'Invalid data' });
			}
			if (Object.keys(updatePayload).length === 0) {
				return res.status(400).json({ error: 'No data to update' });
			}

			const [updatedRows] = await Player.update(updatePayload, { where: { id: playerId } });
			if (updatedRows === 0) {
				return res.status(404).json({ error: 'Player not found for update' });
			}

			const updatedPlayer = await Player.findByPk(playerId, { attributes: PLAYER_ATTRIBUTES });
			return res.json(updatedPlayer);
		} catch (error) {
			return res.status(500).json({ error: 'Error updating player' });
		}
	}

	static async deletePlayer(req, res) {
		try {
			const playerId = validateId(req.params.id);
			if (!playerId) {
				return res.status(400).json({ error: 'Invalid player ID' });
			}

			const deletedRows = await Player.destroy({ where: { id: playerId } });
			if (deletedRows === 0) {
				return res.status(404).json({ error: 'Player not found for deletion' });
			}

			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: 'Error deleting player' });
		}
	}

	static async getPopularPlayers(req, res) {
		try {
			let pagination;
			try {
				pagination = parsePaginationParams(req.query);
			} catch (paginationError) {
				const message = paginationErrorMessages[paginationError.code] || 'Invalid pagination parameters';
				return res.status(400).json({ error: message });
			}

			const { pageNumber, limitNumber, offset } = pagination;

			const { rows, count } = await Player.findAndCountAll({
				attributes: PLAYER_ATTRIBUTES,
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
			return res.status(500).json({ error: 'Error fetching popular players list' });
		}
	}

	static async importPlayersFromApiFootball(req, res) {
		try {
			const seasonValue = parsePositiveIntOrDefault(req.query.season, undefined);
			if (seasonValue === undefined) {
				return res.status(400).json({ error: 'season is required' });
			}
			if (seasonValue === null) {
				return res.status(400).json({ error: 'season must be a positive integer' });
			}

			const leagueValue = parsePositiveIntOrDefault(req.query.league, undefined);
			if (leagueValue === undefined) {
				return res.status(400).json({ error: 'league is required' });
			}
			if (leagueValue === null) {
				return res.status(400).json({ error: 'league must be a positive integer' });
			}

			const teamValue = parsePositiveIntOrDefault(req.query.team, undefined);
			if (teamValue === undefined) {
				return res.status(400).json({ error: 'team is required' });
			}
			if (teamValue === null) {
				return res.status(400).json({ error: 'team must be a positive integer' });
			}

			const pageNumber = parsePositiveIntOrDefault(req.query.page, 1);
			if (pageNumber === null) {
				return res.status(400).json({ error: 'page must be a positive integer' });
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
				return res.status(200).json({ imported: 0, message: 'No players found' });
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
						reason: error?.message || 'Unknown'
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
					error: 'Error from API Football',
					details: error.response.data
				});
			}
			return res.status(500).json({ error: 'Error importing players from API Football', details: error.message });
		}
	}

	/**
	 * Get player statistics from API Football
	 * Query params: playerid, teamid, leagueid, season
	 */
	static async getPlayerStatsWithFilters(req, res) {
		try {
			const playerId = parseRequiredPositiveIntParam(req.query.playerid, 'playerid');
			const seasonValue = parseOptionalPositiveIntParam(req.query.season, 'season');
			const leagueId = parseOptionalPositiveIntParam(req.query.leagueid, 'leagueid');
			const teamId = parseOptionalPositiveIntParam(req.query.teamid, 'teamid');

			const params = { id: playerId };
			if (seasonValue !== undefined) {
				params.season = seasonValue;
			}
			if (leagueId !== undefined) {
				params.league = leagueId;
			}
			if (teamId !== undefined) {
				params.team = teamId;
			}

			const response = await axios.get('https://v3.football.api-sports.io/players', {
				params,
				headers: {
					'x-apisports-key': process.env.API_FOOTBALL_KEY,
					'x-rapidapi-host': 'v3.football.api-sports.io'
				}
			});

			return res.status(200).json({
				success: true,
				data: response.data
			});
		} catch (error) {
			if (queryParamErrorMessages[error.code]) {
				return res.status(400).json({ error: formatQueryParamErrorMessage(error) });
			}
			if (error.response) {
				return res.status(error.response.status).json({
					success: false,
					error: 'Error from API Football',
					details: error.response.data
				});
			}
			if (error.code === 'ECONNABORTED') {
				return res.status(504).json({
					success: false,
					error: 'Timeout when connecting to API Football'
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Error getting player statistics',
				details: error.message
			});
		}
	}
};

export default PlayersController;
