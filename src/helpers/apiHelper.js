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



module.exports = { 
  getCountries
};