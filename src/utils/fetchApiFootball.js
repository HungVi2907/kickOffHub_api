import { apiFootballGet } from '../modules/apiFootball/services/apiFootball.service.js';

export async function fetchCountries() {
  try {
    const data = await apiFootballGet('/countries');
    return data.response;
  } catch (error) {
    throw new Error('Failed to fetch countries from API-Football');
  }
}
