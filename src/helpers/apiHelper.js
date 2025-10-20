const axios = require('axios');

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_HOST_HEADER = 'v3.football.api-sports.io';

const defaultHeaders = () => ({
  'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
  'x-rapidapi-host': API_HOST_HEADER
});

async function getCountries() {
  try {
    const response = await axios.get(`${API_BASE_URL}/countries`, {
      headers: defaultHeaders()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getVenuesByCountryName(countryName) {
  try {
    const response = await axios.get(`${API_BASE_URL}/venues`, {
      params: { country: countryName },
      headers: defaultHeaders()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function getLeaguesByCountryCode(countryCode) {
  try {
    const response = await axios.get(`${API_BASE_URL}/leagues`, {
      params: { code: countryCode },
      headers: defaultHeaders()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getCountries,
  getLeaguesByCountryCode,
  getVenuesByCountryName
};