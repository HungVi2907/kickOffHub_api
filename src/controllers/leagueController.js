const { getLeagues } = require('../config/api-football');
const { mapLeagueData } = require('../helpers/apiHelper');
const { insertLeagues } = require('../helpers/dataMapper');
const pool = require('../config/db');

async function fetchAndStoreLeagues(req, res) {
  try {
    // 1. Fetch leagues data from API
    const apiResponse = await getLeagues();
    
    // 2. Map API data to our schema
    const leagues = mapLeagueData(apiResponse);
    
    // 3. Insert leagues into database
    await insertLeagues(pool, leagues);
    
    res.status(200).json({
      success: true,
      message: `${leagues.length} leagues stored/updated successfully`
    });
  } catch (error) {
    console.error('Error storing leagues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  fetchAndStoreLeagues
};