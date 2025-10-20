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

/**
 * Maps league data from API-Football format to our database schema
 * @param {Object} apiLeagueItem - A league item from API response
 * @param {number} countryId - Local database country identifier
 * @returns {Object} - League object for database insertion
 */
function mapLeagueData(apiLeagueItem, countryId) {
  const leagueInfo = apiLeagueItem?.league || {};

  return {
    league_id: leagueInfo.id,
    name: leagueInfo.name,
    logo_url: leagueInfo.logo || null,
    country_id: countryId
  };
}

/**
 * Maps venue data from API-Football format to our database schema
 * @param {Object} apiVenue - A venue object from API response
 * @param {number} countryId - Local database country identifier
 * @returns {Object} - Venue object for database insertion
 */
function mapVenueData(apiVenue, countryId) {
  const venueInfo = apiVenue || {};
  const capacityRaw = Number(venueInfo.capacity);
  const capacityValue = Number.isFinite(capacityRaw) ? capacityRaw : null;

  return {
    venue_id: venueInfo.id,
    name: venueInfo.name,
    address: venueInfo.address || null,
    city: venueInfo.city || null,
    country_id: countryId,
    capacity: capacityValue,
    surface: venueInfo.surface || null,
    image_url: venueInfo.image || null
  };
}

module.exports = {
  mapCountryData,
  mapLeagueData,
  mapVenueData
};