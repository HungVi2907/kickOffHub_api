import { z } from 'zod';

const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a positive integer'),
  }),
});

const baseUserBody = {
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Email is invalid'),
};

export const createUserSchema = z.object({
  body: z.object(baseUserBody),
});

export const updateUserSchema = z.object({
  params: userIdSchema.shape.params,
  body: z.object({
    name: baseUserBody.name.optional(),
    email: baseUserBody.email.optional(),
  }).refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide at least one field to update',
    path: ['body'],
  }),
});

export const userIdParamSchema = userIdSchema;
