/**
 * =============================================================================
 * FILE: src/contracts/tokens.js
 * =============================================================================
 * 
 * @fileoverview Dependency Injection Container Tokens
 * 
 * @description
 * Định nghĩa các token constants cho Dependency Injection container.
 * Sử dụng tokens thay vì magic strings để type-safe và dễ refactor.
 * 
 * ## Token Categories:
 * 
 * ### Models (TOKENS.models.*)
 * Sequelize model classes cho database tables:
 * - Post, Comment, Team, Country, Tag
 * - PostLike, PostReport, League, Season
 * - LeagueTeamSeason, Player, PlayerTeamLeagueSeason, User
 * 
 * ### Services (TOKENS.services.*)
 * Business logic services:
 * - auth, posts, comments, teams, countries
 * - tags, postLikes, postReports, leagues, seasons
 * - apiFootball, leagueTeamSeason, players, playerTeamLeagueSeason, users
 * 
 * ### Queues (TOKENS.queues.*)
 * Background job queues (BullMQ):
 * - teamImport: Queue để import teams từ API-Football
 * 
 * ## Usage Pattern:
 * ```javascript
 * import { TOKENS, registerIfMissing } from '../contracts/tokens.js';
 * 
 * // Get service từ container
 * const postsService = container.get(TOKENS.services.posts);
 * 
 * // Register với lazy factory
 * registerIfMissing(container, TOKENS.models.Post, PostModel);
 * ```
 * 
 * @module contracts/tokens
 * @exports {Object} TOKENS - Frozen object chứa all DI tokens
 * @exports {Function} registerIfMissing - Helper để register dependencies
 * 
 * =============================================================================
 */

import { Model } from 'sequelize';

// =============================================================================
// DI Container Tokens
// =============================================================================

/**
 * Frozen object chứa tất cả dependency injection tokens.
 * Sử dụng Object.freeze để prevent mutation.
 * 
 * @constant {Object}
 * @property {Object} models - Tokens cho Sequelize models
 * @property {Object} services - Tokens cho business services
 * @property {Object} queues - Tokens cho job queues
 */
export const TOKENS = Object.freeze({
  /**
   * Tokens cho Sequelize Model classes.
   * Mỗi token map tới một database table.
   */
  models: {
    Post: 'models.Post',                             // Bài viết
    Comment: 'models.Comment',                       // Bình luận
    Team: 'models.Team',                             // Đội bóng
    Country: 'models.Country',                       // Quốc gia
    Tag: 'models.Tag',                               // Thẻ tag
    PostLike: 'models.PostLike',                     // Lượt thích bài viết
    PostReport: 'models.PostReport',                 // Báo cáo bài viết
    League: 'models.League',                         // Giải đấu
    Season: 'models.Season',                         // Mùa giải
    LeagueTeamSeason: 'models.LeagueTeamSeason',     // Quan hệ giải-đội-mùa
    Player: 'models.Player',                         // Cầu thủ
    PlayerTeamLeagueSeason: 'models.PlayerTeamLeagueSeason', // Quan hệ cầu thủ-đội-giải-mùa
    User: 'models.User',                             // Người dùng
  },
  
  /**
   * Tokens cho business logic services.
   * Mỗi service xử lý một domain cụ thể.
   */
  services: {
    auth: 'services.auth',                           // Authentication service
    posts: 'services.posts',                         // Posts management
    comments: 'services.comments',                   // Comments management
    teams: 'services.teams',                         // Teams management
    countries: 'services.countries',                 // Countries management
    tags: 'services.tags',                           // Tags management
    postLikes: 'services.postLikes',                 // Post likes management
    postReports: 'services.postReports',             // Post reports management
    leagues: 'services.leagues',                     // Leagues management
    seasons: 'services.seasons',                     // Seasons management
    apiFootball: 'services.apiFootball',             // External API-Football integration
    leagueTeamSeason: 'services.leagueTeamSeason',   // League-Team-Season relations
    players: 'services.players',                     // Players management
    playerTeamLeagueSeason: 'services.playerTeamLeagueSeason', // Player relations
    users: 'services.users',                         // Users management
  },
  
  /**
   * Tokens cho BullMQ job queues.
   * Background processing cho heavy tasks.
   */
  queues: {
    teamImport: 'queues.teamImport', // Queue import teams từ API-Football
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Kiểm tra xem value có phải là Sequelize Model class hay không.
 * Dùng để phân biệt Model class với factory function.
 * 
 * @private
 * @param {*} value - Value cần kiểm tra
 * @returns {boolean} True nếu là Sequelize Model class
 */
function isSequelizeModelClass(value) {
  return typeof value === 'function' && value.prototype instanceof Model;
}

/**
 * Helper function để register dependency vào container nếu chưa tồn tại.
 * Tự động invoke factory function nếu cần.
 * 
 * @param {Map} container - DI container (Map object)
 * @param {string} token - Token key để register
 * @param {*} factory - Value hoặc factory function để register
 * @returns {*} Registered value từ container
 * 
 * @example
 * // Register Model class (không invoke)
 * registerIfMissing(container, TOKENS.models.Post, PostModel);
 * 
 * // Register factory function (sẽ invoke)
 * registerIfMissing(container, TOKENS.services.posts, () => new PostsService());
 * 
 * // Register plain value
 * registerIfMissing(container, 'config.port', 3000);
 */
export function registerIfMissing(container, token, factory) {
  if (!container.has(token)) {
    // Chỉ invoke nếu là function và KHÔNG phải Sequelize Model class
    const shouldInvokeFactory = typeof factory === 'function' && !isSequelizeModelClass(factory);
    container.set(token, shouldInvokeFactory ? factory() : factory);
  }
  return container.get(token);
}
