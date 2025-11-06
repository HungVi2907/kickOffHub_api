import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint GET /api/test
router.get('/test', (req, res) => {
  res.json({
    message: "Test route is working!",
    time: new Date().toISOString(),
    status: "ok"
  });
});

// Endpoint GET /api/test/api_football
router.get('/test/api_football', async (req, res) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/leagues?country=world', {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    res.json(response.data);
  } catch (error) { 
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
router.get('/test/coach', async (req, res) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/coachs?team=33', {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.get('/test/venues', async (req, res) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/venues?id=596', {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


export default router;