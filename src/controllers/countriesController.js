import Country from '../models/Country.js';
import { fetchCountries } from '../utils/fetchApiFootball.js';

// Controller cho Countries
class CountriesController {
  // Lấy danh sách tất cả countries
  static async getAllCountries(req, res) {
    try {
      const countries = await Country.findAll();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách countries' });
    }
  }

  // Lấy thông tin một country theo ID
  static async getCountryById(req, res) {
    try {
      const { id } = req.params;
      const country = await Country.findByPk(id);
      if (!country) {
        return res.status(404).json({ error: 'Country không tồn tại' });
      }
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin country' });
    }
  }

  // Thêm country mới
  static async createCountry(req, res) {
    try {
      const { name, code, flag } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Tên là bắt buộc' });
      }
      const country = await Country.create({ name, code, flag });
      res.status(201).json(country);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi thêm country' });
    }
  }

  // Cập nhật country
  static async updateCountry(req, res) {
    try {
      const { id } = req.params;
      const { name, code, flag } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Tên là bắt buộc' });
      }
      const [updated] = await Country.update(
        { name, code, flag },
        { where: { id } }
      );
      if (updated === 0) {
        return res.status(404).json({ error: 'Country không tồn tại' });
      }
      const country = await Country.findByPk(id);
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật country' });
    }
  }

  // Xóa country
  static async deleteCountry(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Country.destroy({ where: { id } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'Country không tồn tại' });
      }
      res.json({ message: 'Country đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa country' });
    }
  }

  // Import countries từ API-Football
  static async importFromApiFootball(req, res) {
    try {
      const countriesData = await fetchCountries();
      let imported = 0;

      for (const country of countriesData) {
        // Upsert country (insert nếu chưa có, update nếu có)
        await Country.upsert({
          name: country.name,
          code: country.code,
          flag: country.flag
        });
        imported++;
      }

      res.json({ imported });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi import countries từ API-Football' });
    }
  }
}

export default CountriesController;