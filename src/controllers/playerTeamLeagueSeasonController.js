import PlayerTeamLeagueSeason from '../models/PlayerTeamLeagueSeason.js';
import Player from '../models/Player.js';

const parsePositiveInt = (value, fieldName, { required = false } = {}) => {
	if (value === undefined || value === null || value === '') {
		if (required) {
			throw new Error(`MISSING_${fieldName}`);
		}
		return undefined;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') {
		if (required) {
			throw new Error(`MISSING_${fieldName}`);
		}
		return undefined;
	}
	const parsed = Number.parseInt(trimmed, 10);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`INVALID_${fieldName}`);
	}
	return parsed;
};

const buildPayload = (body, { allowPartial = false } = {}) => {
	const payload = {};
	const fields = ['playerId', 'leagueId', 'teamId', 'season'];
	for (const field of fields) {
		if (Object.prototype.hasOwnProperty.call(body, field)) {
			const parsed = parsePositiveInt(body[field], field, { required: !allowPartial });
			if (parsed !== undefined) {
				payload[field] = parsed;
			}
		}
	}

	if (!allowPartial) {
		for (const field of fields) {
			if (!Object.prototype.hasOwnProperty.call(payload, field)) {
				throw new Error(`MISSING_${field}`);
			}
		}
	}

	return payload;
};

const playerAttributes = [
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

const handleValidationError = (error, res) => {
	if (error instanceof Error) {
		if (error.message.startsWith('MISSING_')) {
			const field = error.message.replace('MISSING_', '');
			return res.status(400).json({ error: `Thiếu thông tin bắt buộc: ${field}` });
		}
		if (error.message.startsWith('INVALID_')) {
			const field = error.message.replace('INVALID_', '');
			return res.status(400).json({ error: `Trường ${field} phải là số nguyên dương hợp lệ` });
		}
	}
	return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
};
const PlayerTeamLeagueSeasonController = {
	async updateMapping(req, res) {
		try {
			let identifiers;
			try {
				identifiers = {
					playerId: parsePositiveInt(req.params.playerId, 'playerId', { required: true }),
					leagueId: parsePositiveInt(req.params.leagueId, 'leagueId', { required: true }),
					teamId: parsePositiveInt(req.params.teamId, 'teamId', { required: true }),
					season: parsePositiveInt(req.params.season, 'season', { required: true })
				};
			} catch (error) {
				return handleValidationError(error, res);
			}

			let updatePayload;
			try {
				updatePayload = buildPayload(req.body, { allowPartial: true });
			} catch (error) {
				return handleValidationError(error, res);
			}

			if (Object.keys(updatePayload).length === 0) {
				return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
			}

			const mapping = await PlayerTeamLeagueSeason.findOne({ where: identifiers });
			if (!mapping) {
				return res.status(404).json({ error: 'Không tìm thấy bản ghi để cập nhật' });
			}

			try {
				await mapping.update(updatePayload);
			} catch (error) {
				if (error?.name === 'SequelizeUniqueConstraintError') {
					return res.status(409).json({ error: 'Bản ghi với thông tin mới đã tồn tại' });
				}
				if (error?.name === 'SequelizeForeignKeyConstraintError') {
					return res.status(409).json({ error: 'playerId hoặc teamId hoặc leagueId không tồn tại trong hệ thống' });
				}
				throw error;
			}

			await mapping.reload();

			return res.json(mapping);
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi cập nhật bản ghi' });
		}
	},

	async deleteMapping(req, res) {
		try {
			let identifiers;
			try {
				identifiers = {
					playerId: parsePositiveInt(req.params.playerId, 'playerId', { required: true }),
					leagueId: parsePositiveInt(req.params.leagueId, 'leagueId', { required: true }),
					teamId: parsePositiveInt(req.params.teamId, 'teamId', { required: true }),
					season: parsePositiveInt(req.params.season, 'season', { required: true })
				};
			} catch (error) {
				return handleValidationError(error, res);
			}

			const deletedRows = await PlayerTeamLeagueSeason.destroy({ where: identifiers });
			if (deletedRows === 0) {
				return res.status(404).json({ error: 'Không tìm thấy bản ghi để xóa' });
			}

			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi xóa bản ghi' });
		}
	},

	async findPlayersByTeamLeagueSeason(req, res) {
		try {
			let leagueId;
			let teamId;
			let season;
			try {
				leagueId = parsePositiveInt(req.query.leagueId, 'leagueId', { required: true });
				teamId = parsePositiveInt(req.query.teamId, 'teamId', { required: true });
				season = parsePositiveInt(req.query.season, 'season', { required: true });
			} catch (error) {
				return handleValidationError(error, res);
			}

			const mappings = await PlayerTeamLeagueSeason.findAll({
				where: { leagueId, teamId, season },
				attributes: ['playerId', 'leagueId', 'teamId', 'season'],
				include: [
					{
						model: Player,
						as: 'player',
						attributes: playerAttributes,
						required: true
					}
				],
				order: [[{ model: Player, as: 'player' }, 'name', 'ASC']]
			});

			return res.json({
				filters: { leagueId, teamId, season },
				total: mappings.length,
				players: mappings.map((record) => ({
					playerId: record.playerId,
					leagueId: record.leagueId,
					teamId: record.teamId,
					season: record.season,
					player: record.player
				}))
			});
		} catch (error) {
			return res.status(500).json({ error: 'Lỗi khi tìm cầu thủ theo đội và giải đấu' });
		}
	}
};

export default PlayerTeamLeagueSeasonController;
