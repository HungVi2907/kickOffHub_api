/**
 * @fileoverview Teams Module - Entry Point
 * @description Module đăng ký và cấu hình cho quản lý đội bóng (Teams).
 * Module này chịu trách nhiệm đăng ký các thành phần của teams vào dependency injection container
 * và export các routes, services, models cần thiết.
 * 
 * @module modules/teams
 * @requires ./routes/teams.routes.js - Express routers cho teams API
 * @requires ./models/team.model.js - Sequelize model cho Team
 * @requires ./services/teams.service.js - Business logic services
 * @requires ./queues/teamImport.queue.js - Background job queue cho việc import teams
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { publicRouter, privateRouter } from './routes/teams.routes.js';
import Team from './models/team.model.js';
import * as TeamsService from './services/teams.service.js';
import { teamImportQueue, enqueueTeamImportJob } from './queues/teamImport.queue.js';

/**
 * Đăng ký Teams Module vào ứng dụng
 * 
 * @async
 * @function registerTeamsModule
 * @description Hàm khởi tạo module Teams, đăng ký các dependencies vào container
 * và trả về cấu hình module bao gồm routes và public API.
 * 
 * @param {Object} options - Tham số cấu hình
 * @param {Object} options.container - Dependency Injection container để đăng ký services
 * 
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Tên module ('teams')
 * @returns {string} returns.basePath - Base path cho routes ('/')
 * @returns {express.Router} returns.publicRoutes - Router cho public endpoints (không cần auth)
 * @returns {express.Router} returns.privateRoutes - Router cho private endpoints (cần auth)
 * @returns {Object} returns.publicApi - API công khai để các module khác sử dụng
 * @returns {Object} returns.publicApi.Team - Sequelize Team model
 * @returns {Object} returns.publicApi.services - Teams service functions
 * @returns {Object} returns.publicApi.queue - Bull queue instance cho team import
 * @returns {Function} returns.publicApi.enqueueTeamImportJob - Hàm thêm job vào import queue
 * 
 * @example
 * // Đăng ký module trong bootstrap
 * const teamsModule = await registerTeamsModule({ container });
 * app.use(teamsModule.basePath, teamsModule.publicRoutes);
 */
export default async function registerTeamsModule({ container }) {
  // Đăng ký Team model vào container để các module khác có thể inject
  container.set('models.Team', Team);
  
  // Đăng ký Teams service vào container
  container.set('services.teams', TeamsService);
  
  // Đăng ký queue và hàm enqueue cho background job processing
  container.set('queues.teamImport', {
    queue: teamImportQueue,
    enqueue: enqueueTeamImportJob,
  });

  // Trả về cấu hình module để bootstrap đăng ký routes
  return {
    name: 'teams',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    // Public API cho phép các module khác truy cập trực tiếp
    publicApi: {
      Team,
      services: TeamsService,
      queue: teamImportQueue,
      enqueueTeamImportJob,
    },
  };
}
