const axios = require('axios');

async function getLeagues() {
  try {
    console.log('API Key:', process.env.API_FOOTBALL_KEY); // Debug line
    const response = await axios({
      method: 'get',
      url: `https://v3.football.api-sports.io/leagues?country=england`,
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
module.exports = { getLeagues };