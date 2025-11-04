import { Op } from 'sequelize';
import Team from '../models/Team.js';
import { getTeamsByLeague as fetchTeamsByLeague } from '../utils/fetchApiFootball.js';

const TeamsController = {
	async getAllTeams(req, res) {
		try {
			const teams = await Team.findAll();
			res.json(teams);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi lấy danh sách teams' });
		}
	},

	async getTeamById(req, res) {
		try {
			const { id } = req.params;
			const team = await Team.findByPk(id);
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
			const leagueId = Number(req.params.leagueID);
			if (!leagueId) {
				return res.status(400).json({ error: 'leagueID không hợp lệ' });
			}

			const season = req.query.season ? Number(req.query.season) : 2023;
			const apiTeams = await fetchTeamsByLeague(leagueId, season);
			res.json(apiTeams);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi lấy teams theo league' });
		}
	},

	async createTeam(req, res) {
		try {
			// Accept only known fields and coerce leagues_id to integer or null
			const payload = {
				name: req.body.name,
				code: req.body.code ?? null,
				country: req.body.country ?? null,
				founded: req.body.founded ? Number(req.body.founded) : null,
				national: req.body.national ?? false,
				logo: req.body.logo ?? null,
				venue_id: req.body.venue_id ? Number(req.body.venue_id) : null,
				leagues_id: req.body.leagues_id ? Number(req.body.leagues_id) : null
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
			// Build update payload safely
			const updatePayload = {};
			const fields = ['name','code','country','founded','national','logo','venue_id','leagues_id'];
			for (const f of fields) {
				if (Object.prototype.hasOwnProperty.call(req.body, f)) {
					if (f === 'founded' || f === 'venue_id' || f === 'leagues_id') {
						updatePayload[f] = req.body[f] !== null ? Number(req.body[f]) : null;
					} else {
						updatePayload[f] = req.body[f];
					}
				}
			}

			const [updatedRows] = await Team.update(updatePayload, { where: { id } });
			if (updatedRows === 0) {
				return res.status(404).json({ error: 'Team không tồn tại' });
			}
			const updatedTeam = await Team.findByPk(id);
			res.json(updatedTeam);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi cập nhật team' });
		}
	},

	async deleteTeam(req, res) {
		try {
			const { id } = req.params;
			const deletedRows = await Team.destroy({ where: { id } });
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
			const rawName = req.params.name;
			const keyword = typeof rawName === 'string' ? rawName.trim() : '';

			if (!keyword) {
				return res.status(400).json({ error: 'Tên đội bóng không hợp lệ' });
			}

			const rawLimit = Number(req.query.limit);
			const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? rawLimit : 20;

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

	async importTeamsFromLeague(req, res) {
		try {
			const leagueId = Number(req.body.leagueId) || 39;
			const season = Number(req.body.season) || 2023;
			const apiTeams = await fetchTeamsByLeague(leagueId, season);

			if (!Array.isArray(apiTeams) || apiTeams.length === 0) {
				console.log('Không có dữ liệu teams trả về từ API.');
				return res.status(200).json({ message: 'Không có dữ liệu team để import', imported: 0 });
			}

			let processedCount = 0;
			for (const item of apiTeams) {
				const teamData = item?.team;
				if (!teamData?.id) {
					continue;
				}

				const payload = {
					id: teamData.id,
					name: teamData.name,
					code: teamData.code,
					country: teamData.country,
					founded: teamData.founded,
					national: teamData.national ?? false,
					logo: teamData.logo ?? null,
					venue_id: item?.venue?.id ?? null,
					leagues_id: leagueId
				};

				await Team.upsert(payload);
				processedCount += 1;
			}

			console.log(`Đã import/cập nhật ${processedCount} teams từ league ${leagueId}.`);
			res.status(200).json({ message: 'Import teams thành công', imported: processedCount });
		} catch (error) {
			console.error('Lỗi khi import teams:', error);
			res.status(500).json({ error: 'Lỗi khi import dữ liệu teams' });
		}
	},
	async getStatsByTeamIdAndSeason(req, res) {
		try {
			const teamIdParam = req.params.teamId ?? req.params.id ?? req.query.teamId;
			const teamId = Number(teamIdParam);
			if (!Number.isFinite(teamId) || teamId <= 0) {
				return res.status(400).json({ error: 'teamId không hợp lệ' });
			}

			const rawLeague = req.query.league;
			const league = rawLeague ? Number(rawLeague) : 39;
			if (!Number.isFinite(league) || league <= 0) {
				return res.status(400).json({ error: 'league không hợp lệ' });
			}

			const rawSeason = req.query.season;
			let season = 2023;
			if (rawSeason) {
				const parsedSeason = Number(rawSeason);
				if (!Number.isFinite(parsedSeason)) {
					return res.status(400).json({ error: 'season không hợp lệ' });
				}
				season = parsedSeason;
			}

			const queryParams = new URLSearchParams({ league: String(league), team: String(teamId), season: String(season) });
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
				league,
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
