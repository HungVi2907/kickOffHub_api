import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'Must be a positive integer');

export const createCommentSchema = z.object({
  params: z.object({
    postId: idParam,
  }),
  body: z.object({
    content: z.string().trim().min(5).max(500),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    postId: idParam,
    commentId: idParam,
  }),
});
