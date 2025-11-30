import sequelize from '../common/db.js';
import { redisClient } from '../common/redisClient.js';
import { logger } from '../common/logger.js';

export default function registerInfrastructure(container) {
  container.set('sequelize', sequelize);
  container.set('redis', redisClient);
  container.set('logger', logger);
}
