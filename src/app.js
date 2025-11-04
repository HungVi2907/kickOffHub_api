import express from 'express';
import userRoutes from './routes/users.js';
import testRoutes from './routes/test.js';
import countriesRoutes from './routes/countries.js';
import leaguesRoutes from './routes/leagues.js';
import teamsRoutes from './routes/teams.js';
import venuesRoutes from './routes/venues.js';

// Swagger
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Middleware để parse JSON
app.use(express.json());

// --- Swagger setup (serve API docs at /api/docs) ---
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kick Off Hub API',
    version: '1.0.0',
    description: 'API documentation generated from JSDoc comments',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server'
    }
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  // Files containing annotations as above (adjust paths if needed)
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Mount Swagger UI at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sử dụng routes
app.use('/api', userRoutes);
app.use('/api', testRoutes);
app.use('/api', countriesRoutes);
app.use('/api', leaguesRoutes);
app.use('/api', teamsRoutes);
app.use('/api', venuesRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Kick Off Hub API');
});

export default app;
