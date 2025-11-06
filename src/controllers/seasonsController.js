import Season from '../models/Season.js';

class SeasonsController {
  static async getAllSeasons(req, res) {
    try {
      const seasons = await Season.findAll({
        order: [['season', 'DESC']]
      });
      res.json(seasons);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách seasons' });
    }
  }

  static async createSeason(req, res) {
    try {
      const rawSeason = req.body?.season;
      const seasonValue = Number(rawSeason);

      if (!Number.isInteger(seasonValue)) {
        return res.status(400).json({ error: 'Giá trị season không hợp lệ' });
      }

      const [season, created] = await Season.findOrCreate({
        where: { season: seasonValue },
        defaults: { season: seasonValue }
      });

      return res.status(created ? 201 : 200).json(season);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tạo season mới' });
    }
  }

  static async deleteSeason(req, res) {
    try {
      const seasonValue = Number(req.params.season);
      if (!Number.isInteger(seasonValue)) {
        return res.status(400).json({ error: 'Giá trị season không hợp lệ' });
      }

      const deletedRows = await Season.destroy({ where: { season: seasonValue } });
      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Season không tồn tại' });
      }

      return res.json({ message: 'Season đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa season' });
    }
  }
}

export default SeasonsController;
