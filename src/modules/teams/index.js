import { publicRouter, privateRouter } from './routes/teams.routes.js';
import Team from './models/team.model.js';
import * as TeamsService from './services/teams.service.js';
import { teamImportQueue, enqueueTeamImportJob } from './queues/teamImport.queue.js';

export default async function registerTeamsModule({ container }) {
  container.set('models.Team', Team);
  container.set('services.teams', TeamsService);
  container.set('queues.teamImport', {
    queue: teamImportQueue,
    enqueue: enqueueTeamImportJob,
  });

  return {
    name: 'teams',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    publicApi: {
      Team,
      services: TeamsService,
      queue: teamImportQueue,
      enqueueTeamImportJob,
    },
  };
}
