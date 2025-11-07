import Venue from '../models/Venue.js';

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
  }
};

export default venuesController;
