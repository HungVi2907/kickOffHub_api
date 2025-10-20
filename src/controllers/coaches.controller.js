const db = require('../config/db');
const apiHelper = require('../helpers/apiHelper');
const dataMapper = require('../helpers/dataMapper');

const listCoaches = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT coach_id, first_name, last_name, birth_date, nationality, photo_url FROM coaches ORDER BY coach_id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load coaches', details: error.message });
  }
};

const getCoachById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT coach_id, first_name, last_name, birth_date, nationality, photo_url FROM coaches WHERE coach_id = ? LIMIT 1',
      [req.params.coachId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load coach', details: error.message });
  }
};

const createCoach = async (req, res) => {
  const { first_name: firstName, last_name: lastName, birth_date: birthDate, nationality, photo_url: photoUrl } = req.body;

  try {
    await db.query(
      'INSERT INTO coaches (first_name, last_name, birth_date, nationality, photo_url) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, birthDate, nationality, photoUrl]
    );

    res.status(201).json({ message: 'Coach created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coach', details: error.message });
  }
};

const updateCoach = async (req, res) => {
  const { first_name: firstName, last_name: lastName, birth_date: birthDate, nationality, photo_url: photoUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE coaches SET first_name = ?, last_name = ?, birth_date = ?, nationality = ?, photo_url = ? WHERE coach_id = ?',
      [firstName, lastName, birthDate, nationality, photoUrl, req.params.coachId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json({ message: 'Coach updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coach', details: error.message });
  }
};
const deleteCoach = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM coaches WHERE coach_id = ?',
      [req.params.coachId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json({ message: 'Coach removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coach', details: error.message });
  }
};

const syncCoachesFromApi = async (req, res) => {
  try {
    const apiData = await apiHelper.getCoaches();
    const coaches = apiData.response || [];

    for (const apiCoach of coaches) {
      const coach = dataMapper.mapCoachData(apiCoach);

      await db.query(
        'INSERT INTO coaches (first_name, last_name, birth_date, nationality, photo_url) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE last_name = VALUES(last_name), birth_date = VALUES(birth_date), nationality = VALUES(nationality), photo_url = VALUES(photo_url)',
        [coach.first_name, coach.last_name, coach.birth_date, coach.nationality, coach.photo_url]
      );
    }

    res.json({ message: 'Coaches synced successfully', items: coaches.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync coaches', details: error.message });
  }
};

module.exports = {
  listCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  syncCoachesFromApi
};
