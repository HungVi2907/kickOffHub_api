const db = require('../config/db');
const apiHelper = require('../helpers/apiHelper');
const dataMapper = require('../helpers/dataMapper');

const listCountries = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT country_id, name, code, flag_url FROM countries ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load countries', details: error.message });
  }
};

const getCountryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT country_id, name, code, flag_url FROM countries WHERE country_id = ? LIMIT 1',
      [req.params.countryId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load country', details: error.message });
  }
};

const createCountry = async (req, res) => {
  const { name, code, flag_url: flagUrl } = req.body;

  try {
    await db.query(
      'INSERT INTO countries (name, code, flag_url) VALUES (?, ?, ?)',
      [name, code, flagUrl]
    );

    res.status(201).json({ message: 'Country created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create country', details: error.message });
  }
};

const updateCountry = async (req, res) => {
  const { name, code, flag_url: flagUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE countries SET name = ?, code = ?, flag_url = ? WHERE country_id = ?',
      [name, code, flagUrl, req.params.countryId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ message: 'Country updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update country', details: error.message });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM countries WHERE country_id = ?',
      [req.params.countryId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ message: 'Country removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete country', details: error.message });
  }
};

const syncCountriesFromApi = async (req, res) => {
  try {
    const apiData = await apiHelper.getCountries();
    const countries = apiData.response || [];

    for (const apiCountry of countries) {
      const country = dataMapper.mapCountryData(apiCountry);

      await db.query(
        'INSERT INTO countries (name, code, flag_url) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code), flag_url = VALUES(flag_url)',
        [country.name, country.code, country.flag_url]
      );
    }

    res.json({ message: 'Countries synced successfully', items: countries.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync countries', details: error.message });
  }
};

module.exports = {
  listCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  syncCountriesFromApi
};
