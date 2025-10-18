// server.js 

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Đảm bảo đã cài npm install cors

// QUAN TRỌNG: Dùng require() để import Router

dotenv.config();
const app = express();
const PORT = process.env.PORT;
  
// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); 


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('KickOff Hub API is running!');
});


//lấy dữ liệu từ API-Football
const countryRoutes = require('./src/routes/v1/country.routes');
app.use('/api/v1/countries', countryRoutes);

const leagueRoutes = require('./src/routes/v1/league.routes');
app.use('/api/v1/leagues', leagueRoutes);

const testRoutes = require('./src/routes/v1/test.routes');
app.use('/api/v1/test', testRoutes);