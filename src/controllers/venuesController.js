import axios from 'axios';
import Venue from '../models/Venue.js';

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

const parseRequiredPositiveInt = (value, fieldName) => {
	if (value === undefined || value === null || String(value).trim() === '') {
		throw new Error(`MISSING_${fieldName}`);
	}
	const parsed = parsePositiveIntOrDefault(value, null);
	if (parsed === null) {
		throw new Error(`INVALID_${fieldName}`);
	}
	return parsed;
};

const normalizeStringField = (value) => {
	if (value === undefined || value === null) {
		return null;
	}
	const trimmed = String(value).trim();
	return trimmed === '' ? null : trimmed;
};

const parseApiInteger = (value) => {
	if (value === undefined || value === null) {
		return null;
	}
	const trimmed = String(value).trim();
	if (trimmed === '') {
		return null;
	}
	const parsed = Number.parseInt(trimmed, 10);
	return Number.isInteger(parsed) ? parsed : null;
};

const buildVenuePayloadFromApi = (venue) => {
	if (!venue || !parseApiInteger(venue.id)) {
		return null;
	}
	const payload = {
		id: parseApiInteger(venue.id),
		name: normalizeStringField(venue.name),
		address: normalizeStringField(venue.address),
		city: normalizeStringField(venue.city),
		capacity: parseApiInteger(venue.capacity),
		surface: normalizeStringField(venue.surface),
		image: normalizeStringField(venue.image)
	};
	if (!payload.name) {
		return null;
	}
	return payload;
};

const readRequestValue = (req, key) => {
	if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
		return req.body[key];
	}
	return req.query ? req.query[key] : undefined;
};

const venuesController = {
  async getAllVenues(req, res) {
    try {
      const venues = await Venue.findAll(
        { attributes: ['id', 'name', 'address', 'city', 'capacity', 'surface', 'image'] }
      );
      res.json(venues);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách venues' });
    }
  },

  async getVenueById(req, res) {
    try {
      const { id } = req.params;
      const venueId = Number.parseInt(id, 10);
      if (!Number.isInteger(venueId) || venueId <= 0) {
        return res.status(400).json({ error: 'ID venue không hợp lệ' });
      }
      const venue = await Venue.findByPk(venueId,
        { attributes: ['id', 'name', 'address', 'city', 'capacity', 'surface', 'image'] }
      );
      if (!venue) {
        return res.status(404).json({ error: 'Venue không tồn tại' });
      }
      res.json(venue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin venue' });
    }
  },

  async createVenue(req, res) {
    try {
      const venue = await Venue.create(req.body);
      res.status(201).json(venue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tạo venue mới' });
    }
  },

  async updateVenue(req, res) {
    try {
      const { id } = req.params;
      const venueId = Number.parseInt(id, 10);
      if (!Number.isInteger(venueId) || venueId <= 0) {
        return res.status(400).json({ error: 'ID venue không hợp lệ' });
      }
      const [updatedRows] = await Venue.update(req.body, { where: { id: venueId } });
      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Venue không tồn tại' });
      }
      const updatedVenue = await Venue.findByPk(venueId);
      res.json(updatedVenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật venue' });
    }
  },

  async deleteVenue(req, res) {
    try {
      const { id } = req.params;
      const venueId = Number.parseInt(id, 10);
      if (!Number.isInteger(venueId) || venueId <= 0) {
        return res.status(400).json({ error: 'ID venue không hợp lệ' });
      }
      const deletedRows = await Venue.destroy({ where: { id: venueId } });
      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Venue không tồn tại' });
      }
      res.json({ message: 'Venue đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa venue' });
    }
  },

  async importVenuesFromApiFootball(req, res) {
    try {
      const idValue = parseRequiredPositiveInt(readRequestValue(req, 'id'), 'id');

      const response = await axios.get('https://v3.football.api-sports.io/venues', {
        params: { id: idValue },
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      const apiVenues = Array.isArray(response.data?.response) ? response.data.response : [];
      if (apiVenues.length === 0) {
        return res.status(200).json({
          imported: 0,
          message: 'Không có venue nào được trả về từ API-Football'
        });
      }

      const venuePayloads = apiVenues
        .map((venue) => buildVenuePayloadFromApi(venue))
        .filter((payload) => payload !== null);

      if (venuePayloads.length === 0) {
        return res.status(200).json({
          imported: 0,
          message: 'Không có venue hợp lệ để lưu'
        });
      }

      await Venue.bulkCreate(venuePayloads, {
        updateOnDuplicate: ['name', 'address', 'city', 'capacity', 'surface', 'image']
      });

      return res.status(200).json({
        imported: venuePayloads.length,
        id: idValue
      });
    } catch (error) {
      if (error?.message?.startsWith('MISSING_')) {
        const field = error.message.replace('MISSING_', '');
        return res.status(400).json({ error: `${field} là bắt buộc` });
      }
      if (error?.message?.startsWith('INVALID_')) {
        const field = error.message.replace('INVALID_', '');
        return res.status(400).json({ error: `${field} phải là số nguyên dương hợp lệ` });
      }
      if (error.response && error.response.data) {
        return res.status(error.response.status || 500).json({
          error: 'Lỗi từ API Football',
          details: error.response.data
        });
      }
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ error: 'Hết thời gian chờ khi gọi API-Football' });
      }
      return res.status(500).json({ error: 'Lỗi khi import venues từ API Football', details: error.message });
    }
  }
};

export default venuesController;
