import { Model } from 'sequelize';

export const TOKENS = Object.freeze({
  models: {
    Post: 'models.Post',
    Comment: 'models.Comment',
    Team: 'models.Team',
    Country: 'models.Country',
    Tag: 'models.Tag',
    PostLike: 'models.PostLike',
    PostReport: 'models.PostReport',
    League: 'models.League',
    Season: 'models.Season',
    LeagueTeamSeason: 'models.LeagueTeamSeason',
    Player: 'models.Player',
    PlayerTeamLeagueSeason: 'models.PlayerTeamLeagueSeason',
    User: 'models.User',
  },
  services: {
    auth: 'services.auth',
    posts: 'services.posts',
    comments: 'services.comments',
    teams: 'services.teams',
    countries: 'services.countries',
    tags: 'services.tags',
    postLikes: 'services.postLikes',
    postReports: 'services.postReports',
    leagues: 'services.leagues',
    seasons: 'services.seasons',
    apiFootball: 'services.apiFootball',
    leagueTeamSeason: 'services.leagueTeamSeason',
    players: 'services.players',
    playerTeamLeagueSeason: 'services.playerTeamLeagueSeason',
    users: 'services.users',
  },
  queues: {
    teamImport: 'queues.teamImport',
  },
});

function isSequelizeModelClass(value) {
  return typeof value === 'function' && value.prototype instanceof Model;
}

export function registerIfMissing(container, token, factory) {
  if (!container.has(token)) {
    const shouldInvokeFactory = typeof factory === 'function' && !isSequelizeModelClass(factory);
    container.set(token, shouldInvokeFactory ? factory() : factory);
  }
  return container.get(token);
}
