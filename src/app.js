import express from 'express';
import userRoutes from './routes/users.js';
import testRoutes from './routes/test.js';
import countriesRoutes from './routes/countries.js';
import leaguesRoutes from './routes/leagues.js';
import teamsRoutes from './routes/teams.js';
import venuesRoutes from './routes/venues.js';

const app = express();

// Middleware để parse JSON
app.use(express.json());

// Sử dụng routes
app.use('/api', userRoutes);
app.use('/api', testRoutes);
app.use('/api', countriesRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/venues', venuesRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Kick Off Hub API');
});

export default app;
