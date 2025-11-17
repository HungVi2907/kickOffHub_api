import { Op, fn, col, where } from 'sequelize';
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

// Controller cho Countries
class CountriesController {
  // Lấy danh sách tất cả countries
  static async getAllCountries(req, res) {
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

      const { rows, count } = await Country.findAndCountAll({
        attributes: ['id', 'name', 'code', 'flag'],
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
      res.status(500).json({ error: 'Lỗi khi lấy danh sách countries' });
    }
  }

  // Tìm kiếm countries theo tên (hỗ trợ tìm một phần)
  static async getCountriesByName(req, res) {
    try {
      // 1. Validate và chuẩn hóa keyword
      const keywordRaw = typeof req.query.name === 'string' ? req.query.name.trim() : '';
      if (!keywordRaw) {
        return res.status(400).json({ error: 'Tên country là bắt buộc' });
      }

      // 2. Validate limit (nếu có)
      const limitValue = parsePositiveIntOrDefault(req.query.limit, 20);
      if (limitValue === null || limitValue > 100) {
        return res.status(400).json({ error: 'Giá trị limit phải nằm trong khoảng 1-100' });
      }

      // 3. Chuyển lowercase + escape ký tự LIKE
      const keywordLower = keywordRaw.toLowerCase();
      const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
      const likePattern = `%${escapedKeyword}%`;

      // 4. Query
      const countries = await Country.findAll({
        attributes: ['id', 'name', 'code', 'flag'],
        where: where(
          fn('LOWER', col('name')),
          {
            [Op.like]: likePattern
          }
        ),
        order: [['name', 'ASC']],
        limit: limitValue
      });

      // 5. Trả về dạng chuẩn
      return res.json({
        results: countries,
        total: countries.length,
        limit: limitValue,
        keyword: keywordRaw
      });

    } catch (error) {
      return res.status(500).json({ error: 'Lỗi khi tìm kiếm country theo tên' });
    }
  }


  // Lấy thông tin một country theo ID
  static async getCountryById(req, res) {
    try {
      const { id } = req.params;
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'ID country không hợp lệ' });
      }

      const country = await Country.findByPk(countryId, {
        attributes: ['id', 'name', 'code', 'flag']
      });
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
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'ID country không hợp lệ' });
      }
      const { name, code, flag } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Tên là bắt buộc' });
      }
      const [updated] = await Country.update(
        { name, code, flag },
        { where: { id: countryId } }
      );
      if (updated === 0) {
        return res.status(404).json({ error: 'Country không tồn tại' });
      }
      const country = await Country.findByPk(countryId);
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật country' });
    }
  }

  // Xóa country
  static async deleteCountry(req, res) {
    try {
      const { id } = req.params;
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'ID country không hợp lệ' });
      }

      const deleted = await Country.destroy({ where: { id: countryId } });
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