import { privateRouter } from './routes/comments.routes.js';
import Comment from './models/comment.model.js';
import * as CommentsService from './services/comments.service.js';
import { TOKENS } from '../../contracts/tokens.js';

export default async function registerCommentsModule({ container }) {
  container.set(TOKENS.models.Comment, Comment);
  container.set(TOKENS.services.comments, CommentsService);

  return {
    name: 'comments',
    basePath: '/',
    privateRoutes: privateRouter,
    publicApi: {
      Comment,
      services: CommentsService,
    },
  };
}
