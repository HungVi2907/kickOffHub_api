const axios = require('axios');

async function getCountries() {
  try {
    const response = await axios({
      method: 'get',
      url: `https://v3.football.api-sports.io/countries`,
      headers: {
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}



module.exports = { getCountries };

/**
 * Maps league data from API-Football format to our database schema
 * @param {Object} apiResponse - The response from API-Football
 * @returns {Array} - Array of league objects ready for database insertion
 */
function mapLeagueData(apiResponse) {
  if (!apiResponse || !apiResponse.response) {
    return [];
  }
  
  return apiResponse.response.map(item => {
    return {
      league_id: item.league.id,
      name: item.league.name,
      country_id: item.country.id || 49, // Default to England (49) if not available
      logo_url: item.league.logo || null
    };
  });
}

module.exports = {
  mapLeagueData
};