const db = require('../config/db');
const apiHelper = require('../helpers/apiHelper');
const dataMapper = require('../helpers/dataMapper');
const { chunkItems, normalizeBatchSize, sanitizeCountryName } = require('../helpers/syncHelper');

const DEFAULT_SYNC_DELAY_MS = 15000;
const DEFAULT_BATCH_SIZE = 2;

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

const syncVenuesFromApi = async (req, res) => {
  try {
    const [countries] = await db.query(
      'SELECT country_id, name FROM countries WHERE name IS NOT NULL AND name <> ?',
      ['']
    );

    if (!countries.length) {
      return res.status(400).json({
        error: 'No countries available with a valid name. Sync countries first.'
      });
    }

    const validCountries = countries
      .map((country) => ({
        country_id: country.country_id,
        name: sanitizeCountryName(country.name)
      }))
      .filter((country) => Boolean(country.name));

    if (!validCountries.length) {
      return res.status(400).json({
        error: 'No countries with usable names available. Update country records and try again.'
      });
    }

    const requestedBatchSize =
      (req.body && req.body.batchSize) ||
      (req.query && req.query.batchSize) ||
      process.env.VENUE_SYNC_BATCH_SIZE;
    const batchSize = normalizeBatchSize(requestedBatchSize || DEFAULT_BATCH_SIZE);

    const requestedDelayMs =
      (req.body && req.body.delayMs) ||
      (req.query && req.query.delayMs) ||
      process.env.VENUE_SYNC_DELAY_MS;
    const normalizedDelayMs = Number(requestedDelayMs);
    const delayBetweenBatchesMs =
      Number.isFinite(normalizedDelayMs) && normalizedDelayMs >= 0
        ? Math.floor(normalizedDelayMs)
        : DEFAULT_SYNC_DELAY_MS;

    const batches = chunkItems(validCountries, batchSize);

    const summary = {
      batchSize,
      delayBetweenBatchesMs,
      totalCountries: validCountries.length,
      totalBatches: batches.length,
      totalVenuesInserted: 0,
      totalVenuesFailed: 0,
      batchSummaries: []
    };

    for (let index = 0; index < batches.length; index += 1) {
      const batchNumber = index + 1;
      const batch = batches[index];

      console.info(
        `[VenuesSync] Starting batch ${batchNumber}/${batches.length} with ${batch.length} countries (batch size ${batchSize}).`
      );

      const countrySummaries = [];

      const processCountry = async (country) => {
        const countrySummary = {
          countryId: country.country_id,
          countryName: country.name,
          venuesInserted: 0,
          venuesFailed: 0,
          errors: []
        };

        try {
          const apiData = await apiHelper.getVenuesByCountryName(country.name);
          const apiVenues = apiData?.response || [];

          if (!apiVenues.length) {
            console.info(`[VenuesSync] Country ${country.name} returned no venues.`);
            return countrySummary;
          }

          for (const apiVenue of apiVenues) {
            try {
              const venue = dataMapper.mapVenueData(apiVenue, country.country_id);

              if (!venue.venue_id || !venue.name) {
                throw new Error('Venue entry missing required fields.');
              }

              await db.query(
                `INSERT INTO venues (venue_id, name, address, city, country_id, capacity, surface, image_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), city = VALUES(city), country_id = VALUES(country_id), capacity = VALUES(capacity), surface = VALUES(surface), image_url = VALUES(image_url)`,
                [
                  venue.venue_id,
                  venue.name,
                  venue.address,
                  venue.city,
                  venue.country_id,
                  venue.capacity,
                  venue.surface,
                  venue.image_url
                ]
              );

              countrySummary.venuesInserted += 1;
            } catch (venueError) {
              countrySummary.venuesFailed += 1;
              countrySummary.errors.push({
                venueId: apiVenue?.id || null,
                message: venueError.message || 'Unknown venue insert error.'
              });
            }
          }
        } catch (apiError) {
          countrySummary.errors.push({ message: apiError.message || 'API request failed.' });
          console.warn(
            `[VenuesSync] Failed to fetch venues for country ${country.name}: ${apiError.message}`
          );
        }

        console.info(
          `[VenuesSync] Country ${countrySummary.countryName} processed. Inserted: ${countrySummary.venuesInserted}, Failed: ${countrySummary.venuesFailed}.`
        );

        if (countrySummary.errors.length) {
          console.warn(
            `[VenuesSync] Country ${countrySummary.countryName} encountered errors: ${countrySummary.errors
              .map((error) => error.message)
              .join('; ')}`
          );
        }

        return countrySummary;
      };

      for (const country of batch) {
        const summaryForCountry = await processCountry(country);
        countrySummaries.push(summaryForCountry);
      }

      const batchSummary = {
        batchNumber,
        countryCount: batch.length,
        venuesInserted: countrySummaries.reduce((total, item) => total + item.venuesInserted, 0),
        venuesFailed: countrySummaries.reduce((total, item) => total + item.venuesFailed, 0),
        countries: countrySummaries
      };

      summary.totalVenuesInserted += batchSummary.venuesInserted;
      summary.totalVenuesFailed += batchSummary.venuesFailed;
      summary.batchSummaries.push(batchSummary);

      console.info(
        `[VenuesSync] Completed batch ${batchNumber}/${batches.length}. Inserted: ${batchSummary.venuesInserted}, Failed: ${batchSummary.venuesFailed}.`
      );

      if (batchNumber < batches.length && delayBetweenBatchesMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatchesMs));
      }
    }

    res.json({
      message: 'Venues synced successfully',
      ...summary
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync venues', details: error.message });
  }
};

module.exports = {
  listVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  syncVenuesFromApi
};
