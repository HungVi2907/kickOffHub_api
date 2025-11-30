import { z } from 'zod';

const tagItemSchema = z.string().trim().min(2).max(30);
const tagsArraySchema = z.array(tagItemSchema).max(10, 'Too many tags');

export const postIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Post ID must be a positive integer'),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    content: z.string().trim().min(1, 'Content is required'),
    status: z.enum(['public', 'draft']).optional(),
    tags: tagsArraySchema.min(1, 'At least one tag is required').optional(),
  }),
});

export const updatePostSchema = z.object({
  params: postIdParamSchema.shape.params,
  body: z.object({
    title: z.string().trim().min(1).optional(),
    content: z.string().trim().min(1).optional(),
    status: z.enum(['public', 'draft']).optional(),
    tags: tagsArraySchema.optional(),
    removeImage: z.coerce.boolean().optional(),
  }),
});
