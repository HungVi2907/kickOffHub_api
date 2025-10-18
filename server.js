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


// API-Football endpoints grouped under /api/v1
const v1Routes = require('./src/routes/v1');
app.use('/api/v1', v1Routes);

const testRoutes = require('./src/routes/v1/test.routes');
app.use('/api/v1/test', testRoutes);