import axios from 'axios';

// Helper để fetch dữ liệu từ API-Football
export async function fetchCountries() {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/countries', {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    return response.data.response; // Trả về mảng countries
  } catch (error) {
    throw new Error('Failed to fetch countries from API-Football');
  }
}

// Fetch teams by league and season
export async function getTeamsByLeague(leagueId, season) {
  try {
    const response = await axios.get(
      `https://v3.football.api-sports.io/teams?league=${leagueId}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
      }
    );
    return response.data.response; // Trả về mảng teams với venue info
  } catch (error) {
    throw new Error('Failed to fetch teams from API-Football');
  }
}