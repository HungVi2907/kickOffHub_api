exports.mapCountryData = (apiCountry) => ({
  name: apiCountry.name,
  code: apiCountry.code,
  flag_url: apiCountry.flag
});

/**
 * Inserts or updates league data in the database
 * @param {Object} pool - MySQL connection pool
 * @param {Array} leagues - Array of league objects to insert
 * @returns {Promise} - Resolves when all leagues are inserted
 */
async function insertLeagues(pool, leagues) {
  if (!leagues || leagues.length === 0) {
    return;
  }

  const promises = leagues.map(league => {
    return pool.query(
      `INSERT INTO leagues (league_id, name, country_id, logo_url)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       logo_url = VALUES(logo_url)`,
      [league.league_id, league.name, league.country_id, league.logo_url]
    );
  });

  return Promise.all(promises);
}

module.exports = {
  insertLeagues
};