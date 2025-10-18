const db = require('../config/db');

const listVenues = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT venue_id, name, address, city, country_id, capacity, surface, image_url FROM venues ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load venues', details: error.message });
  }
};

const getVenueById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT venue_id, name, address, city, country_id, capacity, surface, image_url FROM venues WHERE venue_id = ? LIMIT 1',
      [req.params.venueId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load venue', details: error.message });
  }
};

const createVenue = async (req, res) => {
  const {
    venue_id: venueId,
    name,
    address,
    city,
    country_id: countryId,
    capacity,
    surface,
    image_url: imageUrl
  } = req.body;

  try {
    await db.query(
      'INSERT INTO venues (venue_id, name, address, city, country_id, capacity, surface, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [venueId, name, address, city, countryId, capacity, surface, imageUrl]
    );

    res.status(201).json({ message: 'Venue created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create venue', details: error.message });
  }
};

const updateVenue = async (req, res) => {
  const { name, address, city, country_id: countryId, capacity, surface, image_url: imageUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE venues SET name = ?, address = ?, city = ?, country_id = ?, capacity = ?, surface = ?, image_url = ? WHERE venue_id = ?',
      [name, address, city, countryId, capacity, surface, imageUrl, req.params.venueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }
};

const deleteVenue = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM venues WHERE venue_id = ?',
      [req.params.venueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ message: 'Venue removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete venue', details: error.message });
  }
};

module.exports = {
  listVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};
