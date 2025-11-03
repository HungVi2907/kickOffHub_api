import League from '../models/League.js';

// Controller cho Leagues
class LeaguesController {
  // Lấy danh sách tất cả leagues
  static async getAllLeagues(req, res) {
    try {
      const leagues = await League.findAll();
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách leagues' });
    }
  }

  // Lấy thông tin một league theo ID
  static async getLeagueById(req, res) {
    try {
      const { id } = req.params;
      const league = await League.findByPk(id);
      if (!league) {
        return res.status(404).json({ error: 'League không tồn tại' });
      }
      res.json(league);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin league' });
    }
  }

  // Thêm league mới
  static async createLeague(req, res) {
    try {
      const { id, name, type, logo } = req.body;
      if (!id || !name) {
        return res.status(400).json({ error: 'ID và tên là bắt buộc' });
      }
      const league = await League.create({ id, name, type, logo });
      res.status(201).json(league);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi thêm league' });
    }
  }

  // Cập nhật league
  static async updateLeague(req, res) {
    try {
      const { id } = req.params;
      const { name, type, logo } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Tên là bắt buộc' });
      }
      const [updated] = await League.update(
        { name, type, logo },
        { where: { id } }
      );
      if (updated === 0) {
        return res.status(404).json({ error: 'League không tồn tại' });
      }
      const league = await League.findByPk(id);
      res.json(league);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật league' });
    }
  }

  // Xóa league
  static async deleteLeague(req, res) {
    try {
      const { id } = req.params;
      const deleted = await League.destroy({ where: { id } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'League không tồn tại' });
      }
      res.json({ message: 'League đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa league' });
    }
  }

}

export default LeaguesController;