const db = require('../config/db');
const apiHelper = require('../helpers/apiHelper');
const dataMapper = require('../helpers/dataMapper');
const { chunkItems, normalizeBatchSize, sanitizeCountryCode } = require('../helpers/syncHelper');

const DEFAULT_SYNC_DELAY_MS = 15000; // default: 15 seconds between batches to satisfy free-tier limits
const DEFAULT_BATCH_SIZE = 2;

const listLeagues = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT league_id, name, country_id, logo_url FROM leagues ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load leagues', details: error.message });
  }
};

const getLeagueById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT league_id, name, country_id, logo_url FROM leagues WHERE league_id = ? LIMIT 1',
      [req.params.leagueId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load league', details: error.message });
  }
};

const createLeague = async (req, res) => {
  const { league_id: leagueId, name, country_id: countryId, logo_url: logoUrl } = req.body;

  try {
    await db.query(
      'INSERT INTO leagues (league_id, name, country_id, logo_url) VALUES (?, ?, ?, ?)',
      [leagueId, name, countryId, logoUrl]
    );

    res.status(201).json({ message: 'League created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league', details: error.message });
  }
};

const updateLeague = async (req, res) => {
  const { name, country_id: countryId, logo_url: logoUrl } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE leagues SET name = ?, country_id = ?, logo_url = ? WHERE league_id = ?',
      [name, countryId, logoUrl, req.params.leagueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json({ message: 'League updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update league', details: error.message });
  }
};

const deleteLeague = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM leagues WHERE league_id = ?',
      [req.params.leagueId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json({ message: 'League removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete league', details: error.message });
  }
};

const syncLeaguesFromApi = async (req, res) => {
  try {
    const [countries] = await db.query(
      'SELECT country_id, code FROM countries_backup WHERE code IS NOT NULL AND code <> ?',
      ['']
    );

    if (!countries.length) {
      return res.status(400).json({
        error: 'No countries available with a valid code. Sync countries first.'
      });
    }

    const validCountries = countries
      .map((country) => ({
        country_id: country.country_id,
        code: sanitizeCountryCode(country.code)
      }))
      .filter((country) => Boolean(country.code));

    if (!validCountries.length) {
      return res.status(400).json({
        error: 'No countries with usable codes available. Update country records and try again.'
      });
    }

    const requestedBatchSize =
      (req.body && req.body.batchSize) || (req.query && req.query.batchSize) || process.env.LEAGUE_SYNC_BATCH_SIZE;
    const batchSize = normalizeBatchSize(requestedBatchSize || DEFAULT_BATCH_SIZE);

    const requestedDelayMs =
      (req.body && req.body.delayMs) || (req.query && req.query.delayMs) || process.env.LEAGUE_SYNC_DELAY_MS;
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
      totalLeaguesInserted: 0,
      totalLeaguesFailed: 0,
      batchSummaries: []
    };

    for (let index = 0; index < batches.length; index += 1) {
      const batchNumber = index + 1;
      const batch = batches[index];

      console.info(
        `[LeaguesSync] Starting batch ${batchNumber}/${batches.length} with ${batch.length} countries (batch size ${batchSize}).`
      );

      const countrySummaries = [];

      const processCountry = async (country) => {
        const countrySummary = {
          countryId: country.country_id,
          countryCode: country.code,
          leaguesInserted: 0,
          leaguesFailed: 0,
          errors: []
        };

        try {
          const apiData = await apiHelper.getLeaguesByCountryCode(country.code);
          const apiLeagues = apiData?.response || [];

          if (!apiLeagues.length) {
            console.info(`[LeaguesSync] Country ${country.code} returned no leagues.`);
            return countrySummary;
          }

          for (const apiLeague of apiLeagues) {
            try {
              const league = dataMapper.mapLeagueData(apiLeague, country.country_id);

              if (!league.league_id || !league.name) {
                throw new Error('League entry missing required fields.');
              }

              await db.query(
                `INSERT INTO leagues (league_id, name, country_id, logo_url)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name = VALUES(name), country_id = VALUES(country_id), logo_url = VALUES(logo_url)` ,
                [league.league_id, league.name, league.country_id, league.logo_url]
              );

              countrySummary.leaguesInserted += 1;
            } catch (leagueError) {
              countrySummary.leaguesFailed += 1;
              countrySummary.errors.push({
                leagueId: apiLeague?.league?.id || null,
                message: leagueError.message || 'Unknown league insert error.'
              });
            }
          }
        } catch (apiError) {
          countrySummary.errors.push({ message: apiError.message || 'API request failed.' });
          console.warn(
            `[LeaguesSync] Failed to fetch leagues for country ${country.code}: ${apiError.message}`
          );
        }

        console.info(
          `[LeaguesSync] Country ${countrySummary.countryCode} processed. Inserted: ${countrySummary.leaguesInserted}, Failed: ${countrySummary.leaguesFailed}.`
        );

        if (countrySummary.errors.length) {
          console.warn(
            `[LeaguesSync] Country ${countrySummary.countryCode} encountered errors: ${countrySummary.errors
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
        leaguesInserted: countrySummaries.reduce((total, item) => total + item.leaguesInserted, 0),
        leaguesFailed: countrySummaries.reduce((total, item) => total + item.leaguesFailed, 0),
        countries: countrySummaries
      };

      summary.totalLeaguesInserted += batchSummary.leaguesInserted;
      summary.totalLeaguesFailed += batchSummary.leaguesFailed;
      summary.batchSummaries.push(batchSummary);

      console.info(
        `[LeaguesSync] Completed batch ${batchNumber}/${batches.length}. Inserted: ${batchSummary.leaguesInserted}, Failed: ${batchSummary.leaguesFailed}.`
      );

      if (batchNumber < batches.length) {
        await new Promise((r) => setTimeout(r, delayBetweenBatchesMs));
      }
    }

    res.json({
      message: 'Leagues synced successfully',
      ...summary
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync leagues', details: error.message });
  }
};

module.exports = {
  listLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague,
  syncLeaguesFromApi
};
