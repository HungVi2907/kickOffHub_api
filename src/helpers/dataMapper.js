/**
 * Maps country data from API-Football format to our database schema
 * @param {Object} apiCountry - A country object from API response
 * @returns {Object} - Country object for database insertion
 */
function mapCountryData(apiCountry) {
  return {
    name: apiCountry.name,
    code: apiCountry.code,
    flag_url: apiCountry.flag
  };
}

module.exports = {
  mapCountryData
};