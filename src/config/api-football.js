const axios = require('axios');

async function getLeagues_test() {
  try {
    console.log('API Key:', process.env.API_FOOTBALL_KEY); // Debug line
    const response = await axios({
      method: 'get',
      url: `https://v3.football.api-sports.io/leagues?code=GB-ENG`,
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

async function getCoaches_test() {
  try {
    console.log('API Key:', process.env.API_FOOTBALL_KEY); // Debug line
    const response = await axios({
      method: 'get',
      url: `https://v3.football.api-sports.io/coachs`,
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
module.exports = { getLeagues_test, getCoaches_test };