// server.js 

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Đảm bảo đã cài npm install cors

// QUAN TRỌNG: Dùng require() để import Router
const dataRoutes = require('./src/routes/v1/data.routes.js');

dotenv.config();
const app = express();
const PORT = process.env.PORT;;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); 


app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('KickOff Hub API is running!');
});
const playerRoutes = require('./src/routes/v1/player.routes');
app.use('/v1', playerRoutes);

const userRoutes = require('./src/routes/v1/user.routes');
app.use('/v1', userRoutes);