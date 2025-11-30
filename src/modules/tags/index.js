import router from './routes/tags.routes.js';
import Tag from './models/tag.model.js';
import * as TagsService from './services/tags.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerTagsModule({ container }) {
  registerIfMissing(container, TOKENS.models.Tag, Tag);
  container.set(TOKENS.services.tags, TagsService);

  return {
    name: 'tags',
    basePath: '/',
    routes: router,
    publicApi: {
      Tag,
      services: TagsService,
    },
  };
}
