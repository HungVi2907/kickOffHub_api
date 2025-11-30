import { z } from 'zod';
import { postIdParamSchema } from '../../posts/validation/posts.validation.js';

export const reportPostSchema = z.object({
  params: postIdParamSchema.shape.params,
  body: z.object({
    reason: z.string().trim().min(5).max(500).optional(),
  }),
});
