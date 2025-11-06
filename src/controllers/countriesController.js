import { Op, fn, col, where } from 'sequelize';
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

  // Tìm kiếm countries theo tên (hỗ trợ tìm một phần)
  static async getCountriesByName(req, res) {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: 'Tên country là bắt buộc' });
      }

      const searchTerm = name.trim().toLowerCase();
      if (!searchTerm) {
        return res.status(400).json({ error: 'Tên country không được để trống' });
      }

      const countries = await Country.findAll({
        where: where(fn('LOWER', col('name')), {
          [Op.like]: `%${searchTerm}%`
        })
      });

      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tìm kiếm country theo tên' });
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

}

export default CountriesController;