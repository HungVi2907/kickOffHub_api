import router from './routes/postReports.routes.js';
import PostReport from './models/postReport.model.js';
import * as PostReportsService from './services/postReports.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerPostReportsModule({ container }) {
  registerIfMissing(container, TOKENS.models.PostReport, PostReport);
  container.set(TOKENS.services.postReports, PostReportsService);

  return {
    name: 'postReports',
    basePath: '/',
    routes: router,
    publicApi: {
      PostReport,
      services: PostReportsService,
    },
  };
}
