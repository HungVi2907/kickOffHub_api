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
			const team = await Team.create(req.body);
			res.status(201).json(team);
		} catch (error) {
			res.status(500).json({ error: 'Lỗi khi tạo team mới' });
		}
	},

	async updateTeam(req, res) {
		try {
			const { id } = req.params;
			const [updatedRows] = await Team.update(req.body, { where: { id } });
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
					venue_id: item?.venue?.id ?? null
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
	}
};

export default TeamsController;
