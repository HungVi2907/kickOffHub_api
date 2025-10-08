const axios = require('axios');

async function getPlayerProfile(playerId) {
  try {
    const response = await axios({
      method: 'get',
      url: `https://v3.football.api-sports.io/players/profiles?player=${276}`,
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

module.exports = { getPlayerProfile };