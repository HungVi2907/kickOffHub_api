import LeagueTeamSeason from '../models/LeagueTeamSeason.js';
import Team from '../models/Team.js';

class LeagueTeamSeasonController {
  static async getAll(req, res) {
    try {
      const records = await LeagueTeamSeason.findAll();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách leagues_teams_season' });
    }
  }

  static async getByLeagueAndSeason(req, res) {
    try {
      const leagueId = Number(req.params.leagueId);
      const season = Number(req.params.season);
      if (!Number.isInteger(leagueId) || !Number.isInteger(season)) {
        return res.status(400).json({ error: 'leagueId hoặc season không hợp lệ' });
      }

      const records = await LeagueTeamSeason.findAll({
        where: { leagueId, season },
        attributes: ['teamId']
      });

      if (records.length === 0) {
        return res.json([]);
      }

      const teamIds = [...new Set(records.map((record) => record.teamId))];
      const teams = await Team.findAll({
        where: { id: teamIds },
        attributes: ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id']
      });
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy dữ liệu theo leagueId và season' });
    }
  }

  static async deleteEntry(req, res) {
    try {
      const leagueId = Number(req.params.leagueId);
      const teamId = Number(req.params.teamId);
      const season = Number(req.params.season);

      if (!Number.isInteger(leagueId) || !Number.isInteger(teamId) || !Number.isInteger(season)) {
        return res.status(400).json({ error: 'leagueId, teamId hoặc season không hợp lệ' });
      }

      const deletedRows = await LeagueTeamSeason.destroy({
        where: { leagueId, teamId, season }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Bản ghi không tồn tại' });
      }

      res.json({ message: 'Bản ghi đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa bản ghi' });
    }
  }
}

export default LeagueTeamSeasonController;
