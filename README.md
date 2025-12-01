# KickOffHub API

> Backend REST API cho ứng dụng KickOffHub - Nền tảng chia sẻ tin tức và thông tin bóng đá.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc](#-kiến-trúc)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [API Endpoints](#-api-endpoints)
- [Modules](#-modules)
- [Database Schema](#-database-schema)
- [Development](#-development)

## 🎯 Tổng quan

KickOffHub API là backend service cung cấp:
- **Authentication**: JWT-based user authentication
- **Posts Management**: CRUD bài viết với image upload (Cloudinary)
- **Comments System**: Bình luận với rate limiting
- **Teams & Players Data**: Tích hợp API-Football
- **Leagues & Seasons**: Quản lý giải đấu và mùa giải
- **Social Features**: Likes, reports, tags

## 🏗 Kiến trúc

### Module-based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Express App                          │
├─────────────────────────────────────────────────────────────┤
│  Middlewares: Auth │ Validation │ Rate Limit │ Upload       │
├─────────────────────────────────────────────────────────────┤
│                    HTTP Router (Pipelines)                  │
├─────────────────────────────────────────────────────────────┤
│   Modules (16 independent feature modules)                  │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │  Auth   │ │  Users  │ │  Posts  │ │Comments │ ...      │
│   │Controller│ │Controller│ │Controller│ │Controller│       │
│   │ Service │ │ Service │ │ Service │ │ Service │          │
│   │  Model  │ │  Model  │ │  Model  │ │  Model  │          │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│           DI Container (Bootstrap/Contracts)                │
├─────────────────────────────────────────────────────────────┤
│   Sequelize ORM  │  Redis Cache  │  BullMQ Jobs            │
├─────────────────────────────────────────────────────────────┤
│   MySQL/TiDB     │  Redis        │  Cloudinary             │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Injection

Project sử dụng DI container pattern (`src/bootstrap/container.js`) với tokens (`src/contracts/tokens.js`) để quản lý dependencies.

## 🛠 Công nghệ sử dụng

| Category | Technology |
|----------|------------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js 4.x |
| ORM | Sequelize 6.x |
| Database | MySQL / TiDB Cloud |
| Cache | Redis (ioredis) |
| Queue | BullMQ |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Zod, express-validator |
| Storage | Cloudinary |
| Logging | Pino, pino-http |
| API Docs | Swagger (swagger-jsdoc) |
| External API | API-Football (với Circuit Breaker - opossum) |

## 📁 Cấu trúc thư mục

```
kick-off-hub-api/
├── server.js                 # Entry point
├── package.json              # Dependencies & scripts
├── certs/                    # SSL certificates (TiDB)
├── migrations/               # Database SQL scripts
│   └── database.sql
└── src/
    ├── app.js                # Express app configuration
    ├── bootstrap/            # DI container & module loading
    │   ├── container.js      # Simple Map-based container
    │   ├── moduleLoader.js   # Dynamic module discovery
    │   └── registerInfrastructure.js
    ├── common/               # Shared utilities
    │   ├── db.js             # Sequelize instance
    │   ├── logger.js         # Pino logger
    │   ├── redisClient.js    # Redis connection
    │   ├── response.js       # ApiResponse helper
    │   ├── errorHandler.js   # Global error middleware
    │   ├── authMiddleware.js # JWT verification
    │   └── exceptions/       # Custom exception classes
    ├── config/               # Configuration files
    │   ├── auth.js           # JWT settings
    │   ├── database.js       # Sequelize config
    │   └── db.js             # Raw MySQL config
    ├── contracts/            # DI tokens & helpers
    │   └── tokens.js
    ├── middlewares/          # Express middlewares
    │   ├── validateSchema.js # Zod validation
    │   ├── validateRequest.js # express-validator
    │   ├── commentRateLimiter.js
    │   ├── normalizeFormData.js
    │   └── upload.js
    ├── modules/              # Feature modules (16 total)
    │   ├── auth/             # Authentication (register/login)
    │   ├── users/            # User management
    │   ├── posts/            # Blog posts với image upload
    │   ├── comments/         # Post comments
    │   ├── teams/            # Football teams
    │   ├── players/          # Player information
    │   ├── countries/        # Country list
    │   ├── leagues/          # Football leagues
    │   ├── seasons/          # League seasons
    │   ├── tags/             # Content tags
    │   ├── venues/           # Stadium data
    │   ├── postLikes/        # Post likes
    │   ├── postReports/      # Post reports
    │   ├── leagueTeamSeason/ # Team-League-Season relations
    │   ├── playerTeamLeagueSeason/ # Player assignments
    │   └── apiFootball/      # External API integration
    ├── pipelines/
    │   ├── httpRouter.js     # Route aggregation
    │   └── jobScheduler.js   # Background jobs
    ├── utils/                # Utility functions
    │   ├── cloudinaryClient.js
    │   ├── cloudinaryMedia.js
    │   └── fetchApiFootball.js
    └── lib/                  # Re-exports for convenience
```

## 🚀 Cài đặt

### Prerequisites

- Node.js >= 18.x
- MySQL 8.x hoặc TiDB Cloud
- Redis (optional - cho caching)

### Steps

```bash
# Clone repository
git clone <repo-url>
cd kick-off-hub-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# (See Configuration section)

# Run database migrations
mysql -u root -p < migrations/database.sql

# Start development server
npm run dev

# Or start production server
npm start
```

## ⚙ Cấu hình

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database (MySQL/TiDB)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kickoffhub
DB_USER=root
DB_PASSWORD=your_password
DB_SSL_CA_PATH=./certs/ca.pem  # Optional for TiDB Cloud

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Redis (Optional - graceful fallback nếu không có)
REDIS_URL=redis://localhost:6379

# Cloudinary (cho image upload)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_FOLDER=kickoffhub/posts

# API-Football (RapidAPI)
API_FOOTBALL_URL=https://api-football-v1.p.rapidapi.com/v3
API_FOOTBALL_KEY=your_rapidapi_key
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get current user | Yes |
| GET | `/users` | List all users | No |
| GET | `/users/:id` | Get user by ID | No |
| POST | `/users` | Create user | No |
| PUT | `/users/:id` | Update user | No |
| DELETE | `/users/:id` | Delete user | No |

### Posts (`/api/posts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts` | List posts (paginated) | No |
| GET | `/posts/:id` | Get post by ID | No |
| POST | `/posts` | Create post | Yes |
| PUT | `/posts/:id` | Update post | Yes |
| DELETE | `/posts/:id` | Delete post | Yes |

### Comments (`/api/comments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts/:postId/comments` | List comments | No |
| POST | `/posts/:postId/comments` | Create comment | Yes |
| DELETE | `/posts/:postId/comments/:id` | Delete comment | Yes |

### Teams (`/api/teams`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/teams` | List teams (paginated) | No |
| GET | `/teams/:id` | Get team by ID | No |
| GET | `/teams/search` | Search teams by name | No |
| GET | `/teams/popular` | Get popular teams | No |
| POST | `/teams/import` | Import from API-Football | No |
| GET | `/teams/:teamId/stats/:leagueId/:season` | Team statistics | No |

### Other Endpoints

- **Countries**: `/api/countries` - CRUD operations
- **Leagues**: `/api/leagues` - League management + import
- **Seasons**: `/api/seasons` - Season management
- **Players**: `/api/players` - Player CRUD + import + statistics
- **Tags**: `/api/tags` - Tag management
- **Venues**: `/api/venues` - Venue management

### API Documentation

Swagger UI available at: `http://localhost:3000/docs`

## 📦 Modules

### Module Structure

Mỗi module có cấu trúc chuẩn:

```
module/
├── index.js          # Module registration vào DI container
├── models/           # Sequelize models
├── repositories/     # Data access layer (optional)
├── services/         # Business logic
├── controllers/      # HTTP handlers
├── routes/           # Express routes + OpenAPI docs
└── validation/       # Zod schemas (optional)
```

### Module Registration

```javascript
// modules/example/index.js
export default async function registerExampleModule({ container }) {
  // Đăng ký dependencies
  registerIfMissing(container, TOKENS.models.Example, ExampleModel);
  container.set(TOKENS.services.example, ExampleService);
  
  return {
    name: 'example',
    basePath: '/',
    routes: router,
    publicApi: {
      Model: ExampleModel,
      services: ExampleService
    }
  };
}
```

## 🗄 Database Schema

### Core Tables

- `users` - User accounts với password hashing
- `posts` - Blog posts với image_url
- `comments` - Post comments
- `tags` - Content tags
- `post_tags` - Post-Tag junction table

### Football Data (từ API-Football)

- `teams` - Football teams
- `players` - Player information
- `countries` - Country list
- `leagues` - Football leagues
- `seasons` - League seasons
- `venues` - Stadium data

### Relations

- `league_team_season` - Team participation per season
- `player_team_league_season` - Player assignments

### Social Features

- `post_likes` - Post likes (user-post junction)
- `post_reports` - Post reports với reason

## 🔧 Development

### Scripts

```bash
# Development with hot reload (nodemon)
npm run dev

# Production
npm start

# Linting
npm run lint
```

### Code Style

- ES Modules (`"type": "module"` trong package.json)
- JSDoc comments cho tất cả files
- Zod schemas cho request validation
- Custom exceptions cho error handling
- Vietnamese comments where helpful

### Adding a New Module

1. Tạo folder trong `src/modules/new-module/`
2. Implement `index.js` với registration function
3. Tạo model, service, controller, routes
4. Module tự động được load bởi `moduleLoader.js`

### Error Handling

Custom exceptions trong `src/common/exceptions/`:
- `AppException` - Base exception (500)
- `ValidationException` - Validation errors (400)
- `AuthException` - Authentication errors (401)
- `ForbiddenException` - Authorization errors (403)
- `NotFoundException` - Resource not found (404)
- `ConflictException` - Duplicate/conflict errors (409)

## 🔐 Security Notes

- **JWT_SECRET**: PHẢI thay đổi trong production
- **Passwords**: Auto-hashed với bcrypt (salt rounds = 10)
- **SQL Injection**: Protected bởi Sequelize ORM parameterized queries
- **Rate Limiting**: Comment rate limiter (5/minute per user)
- **CORS**: Configured cho frontend origin
- **.env file**: KHÔNG commit lên repository

## 📄 License

ISC

## 👥 Authors

KickOffHub Team
