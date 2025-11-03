import Venue from '../models/Venue.js';
import { getTeamsByLeague } from '../utils/fetchApiFootball.js';

const venuesController = {
  async getAllVenues(req, res) {
    try {
      const venues = await Venue.findAll();
      res.json(venues);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách venues' });
    }
  },

  async getVenueById(req, res) {
    try {
      const { id } = req.params;
      const venue = await Venue.findByPk(id);
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
      const [updatedRows] = await Venue.update(req.body, { where: { id } });
      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Venue không tồn tại' });
      }
      const updatedVenue = await Venue.findByPk(id);
      res.json(updatedVenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật venue' });
    }
  },

  async deleteVenue(req, res) {
    try {
      const { id } = req.params;
      const deletedRows = await Venue.destroy({ where: { id } });
      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Venue không tồn tại' });
      }
      res.json({ message: 'Venue đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa venue' });
    }
  },

  async importVenuesFromLeague(req, res) {
    try {
      const leagueId = 39;
      const season = 2023;
      const apiTeams = await getTeamsByLeague(leagueId, season);

      if (!Array.isArray(apiTeams) || apiTeams.length === 0) {
        return res.status(200).json({ message: 'Không có dữ liệu venue để import', imported: 0 });
      }

      let processedCount = 0;
      for (const item of apiTeams) {
        const venueData = item?.venue;
        if (!venueData?.id) {
          continue;
        }

        const payload = {
          id: venueData.id,
          name: venueData.name,
          address: venueData.address,
          city: venueData.city,
          capacity: venueData.capacity,
          surface: venueData.surface,
          image: venueData.image
        };

        await Venue.upsert(payload);
        processedCount += 1;
      }

      console.log(`Đã import/cập nhật ${processedCount} venues từ league ${leagueId}.`);
      res.status(200).json({ message: 'Import venues thành công', imported: processedCount });
    } catch (error) {
      console.error('Lỗi khi import venues:', error);
      res.status(500).json({ error: 'Lỗi khi import dữ liệu venues' });
    }
  }
};

export default venuesController;
