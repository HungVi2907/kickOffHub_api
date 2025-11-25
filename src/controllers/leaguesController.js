import League from '../models/League.js';

const LEAGUE_ATTRIBUTES = [ 'id', 'name', 'type', 'logo'];

const normalizeLeagueId = (rawId) => {
  const parsed = Number.parseInt(rawId, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Controller cho Leagues
class LeaguesController {
  // Lấy danh sách tất cả leagues
  static async getAllLeagues(req, res) {
    try {
      const leagues = await League.findAll({
        attributes: LEAGUE_ATTRIBUTES
      });
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving leagues list' });
    }
  }

  // Lấy thông tin một league theo ID
  static async getLeagueById(req, res) {
    try {
      const leagueId = normalizeLeagueId(req.params.id);
      if (!leagueId) {
        return res.status(400).json({ error: 'League id must be a positive integer' });
      }

      const league = await League.findByPk(leagueId, {
        attributes: LEAGUE_ATTRIBUTES
      });
      if (!league) {
        return res.status(404).json({ error: 'League does not exist' });
      }
      res.json(league);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving league information' });
    }
  }

  // Thêm league mới
  static async createLeague(req, res) {
    try {
      const { id, name, type, logo } = req.body;
      const normalizedId = normalizeLeagueId(id);
      const trimmedName = typeof name === 'string' ? name.trim() : '';

      if (!normalizedId || !trimmedName) {
        return res.status(400).json({ error: 'Valid id and name are required' });
      }

      const league = await League.create({ id: normalizedId, name: trimmedName, type, logo });
      const payload = await League.findByPk(league.id, { attributes: LEAGUE_ATTRIBUTES });
      res.status(201).json(payload);
    } catch (error) {
      res.status(500).json({ error: 'Error creating league' });
    }
  }

  // Cập nhật league
  static async updateLeague(req, res) {
    try {
      const leagueId = normalizeLeagueId(req.params.id);
      if (!leagueId) {
        return res.status(400).json({ error: 'League id must be a positive integer' });
      }

      const { name, type, logo } = req.body;
      const payload = {};

      if (name !== undefined) {
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
          return res.status(400).json({ error: 'Name cannot be empty' });
        }
        payload.name = trimmedName;
      }

      if (type !== undefined) {
        payload.type = type;
      }

      if (logo !== undefined) {
        payload.logo = logo;
      }

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'Provide at least one field to update' });
      }

      const [updated] = await League.update(payload, { where: { id: leagueId } });
      if (updated === 0) {
        return res.status(404).json({ error: 'League does not exist' });
      }
      const league = await League.findByPk(leagueId, { attributes: LEAGUE_ATTRIBUTES });
      res.json(league);
    } catch (error) {
      res.status(500).json({ error: 'Error updating league' });
    }
  }

  // Delete league
  static async deleteLeague(req, res) {
    try {
      const leagueId = normalizeLeagueId(req.params.id);
      if (!leagueId) {
        return res.status(400).json({ error: 'League id must be a positive integer' });
      }

      const deleted = await League.destroy({ where: { id: leagueId } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'League does not exist' });
      }
      res.json({ message: 'League has been successfully deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting league' });
    }
  }
}

export default LeaguesController;