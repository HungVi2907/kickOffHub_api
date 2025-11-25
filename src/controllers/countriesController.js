import { Op, fn, col, where } from 'sequelize';
import Country from '../models/Country.js';

const COUNTRY_ATTRIBUTES = ['id', 'name', 'code', 'flag'];

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

// Controller for Countries
class CountriesController {
  // Get list of all contries with pagination
  static async getAllCountries(req, res) {
    try {
      const { page, limit } = req.query;

      // Validate page
      const pageNumber = parsePositiveIntOrDefault(page, 1);
      if (pageNumber === null) {
        return res.status(400).json({ error: 'Page value must be a positive integer' });
      }

      // Validate limit
      const limitNumber = parsePositiveIntOrDefault(limit, 20);
      if (limitNumber === null) {
        return res.status(400).json({ error: 'Limit value must be a positive integer' });
      }
      if (limitNumber > 100) {
        return res.status(400).json({ error: 'Limit cannot exceed 100' });
      }

      const offset = (pageNumber - 1) * limitNumber;

      const { rows, count } = await Country.findAndCountAll({
        attributes: COUNTRY_ATTRIBUTES,
        order: [['name', 'ASC']],
        limit: limitNumber,
        offset
      });

      const totalPages = Math.ceil(count / limitNumber);

      // Case: page > totalPages
      if (totalPages !== 0 && pageNumber > totalPages) {
        return res.status(400).json({ error: 'Page exceeds total pages' });
      }

      return res.json({
        data: rows,
        pagination: {
          totalItems: count,
          totalPages,
          page: pageNumber,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });
    } catch (error) {
      console.error('Error retrieving countries list:', error);
      return res.status(500).json({ error: 'Error retrieving countries list' });
    }
  }


  // Search countries by name (supports partial match)
  static async searchCountriesByName(req, res) {
    try {
      //  Validate và chuẩn hóa keyword
      const keywordRaw = typeof req.query.name === 'string' ? req.query.name.trim() : '';
      if (!keywordRaw) {
        return res.status(400).json({ error: 'Country name is required' });
      }

      //  Validate limit và page (hỗ trợ pagination)
      const limit = parsePositiveIntOrDefault(req.query.limit, 20);
      if (limit === null) {
        return res.status(400).json({ error: 'limit must be a positive integer' });
      }

      const page = parsePositiveIntOrDefault(req.query.page, 1);
      if (page === null) {
        return res.status(400).json({ error: 'page must be a positive integer' });
      }

      const offset = (page - 1) * limit;

      //  Chuyển keyword về lowercase và escape ký tự đặc biệt LIKE
      const keywordLower = keywordRaw.toLowerCase();
      const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
      const likePattern = `%${escapedKeyword}%`;

      //  Query database
      const { rows: countries, count: totalItems } = await Country.findAndCountAll({
        attributes: COUNTRY_ATTRIBUTES,
        where: where(
          fn('LOWER', col('name')),
          { [Op.like]: likePattern }
        ),
        order: [['name', 'ASC']],
        limit,
        offset,
        // escape ký tự %/_ trong LIKE
        escape: '\\'
      });

      //  Tính tổng số trang
      const totalPages = Math.ceil(totalItems / limit);

      // Trả về JSON chuẩn
      return res.json({
        results: countries,
        pagination: {
          totalItems,
          totalPages,
          page,
          limit
        },
        keyword: keywordRaw
      });

    } catch (error) {
      console.error('searchCountriesByName error:', error);
      return res.status(500).json({ error: 'Error searching countries by name' });
    }
  }



  // Get a single country by ID
  static async getCountryById(req, res) {
    try {
      const { id } = req.params;
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'Country Id is not valid' });
      }

      const country = await Country.findByPk(countryId, {
        attributes: COUNTRY_ATTRIBUTES
      });
      if (!country) {
        return res.status(404).json({ error: 'Country does not exist' });
      }
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving country information' });
    }
  }

  // Thêm country mới
  static async createCountry(req, res) {
    try {
      const { name, code, flag } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const country = await Country.create({ name, code, flag });
      res.status(201).json(country);
    } catch (error) {
      res.status(500).json({ error: 'Error creating country' });
    }
  }

  // Update country
  static async updateCountry(req, res) {
    try {
      const { id } = req.params;
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'Country Id is not valid' });
      }
      const { name, code, flag } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const [updated] = await Country.update(
        { name, code, flag },
        { where: { id: countryId } }
      );
      if (updated === 0) {
        return res.status(404).json({ error: 'Country does not exist' });
      }
      const country = await Country.findByPk(countryId);
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: 'Error updating country' });
    }
  }

  // delete country
  static async deleteCountry(req, res) {
    try {
      const { id } = req.params;
      const countryId = Number.parseInt(id, 10);
      if (!Number.isInteger(countryId) || countryId <= 0) {
        return res.status(400).json({ error: 'Country Id is not valid' });
      }

      const deleted = await Country.destroy({ where: { id: countryId } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'Country does not exist' });
      }
      res.json({ message: 'Country has been successfully deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting country' });
    }
  }

}

export default CountriesController;