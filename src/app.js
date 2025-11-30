                                        
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import userRoutes from './routes/users.js';
import testRoutes from './routes/test.js';
import countriesRoutes from './routes/countries.js';
import leaguesRoutes from './routes/leagues.js';
import teamsRoutes from './routes/teams.js';
import venuesRoutes from './routes/venues.js';
import seasonsRoutes from './routes/seasons.js';
import leagueTeamSeasonRoutes from './routes/leagueTeamSeason.js';
import playersRoutes from './routes/players.js';
import playerTeamLeagueSeasonRoutes from './routes/playerTeamLeagueSeason.js';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import tagsRoutes from './routes/tags.js';

const app = express();

// ===================== CORS FIXED =====================
const allowedOrigins = [
  'https://kickoffhub.space',
  'https://www.kickoffhub.space',
  'https://api.kickoffhub.space',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests without origin (Postman etc.)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// =====================================================

app.use(express.json());
app.use(cookieParser());

// ===================== SWAGGER CONFIG =====================
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kick Off Hub API',
    version: '1.0.0',
    description: 'Kick Off Hub backend API documentation',
  },
  servers: [
    {
      url: 'https://api.kickoffhub.space/api',
      description: 'Production Server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Local Development Server',
    }
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Swagger annotations
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { operationsSorter: 'alpha' },
}));
// ==============================================================

// ===================== ROUTES =====================
app.use('/api', userRoutes);
app.use('/api', testRoutes);
app.use('/api', countriesRoutes);
app.use('/api', leaguesRoutes);
app.use('/api', teamsRoutes);
app.use('/api', venuesRoutes);
app.use('/api', seasonsRoutes);
app.use('/api', leagueTeamSeasonRoutes);
app.use('/api', playersRoutes);
app.use('/api', playerTeamLeagueSeasonRoutes);
app.use('/api', authRoutes);
app.use('/api', postsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', tagsRoutes);
// =====================================================

// Default route
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Kick Off Hub API');
});

export default app;
