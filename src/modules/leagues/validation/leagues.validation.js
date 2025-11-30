import { z } from 'zod';

const leagueIdParams = z.object({
  id: z.string().regex(/^[1-9]\d*$/, 'League id must be a positive integer'),
});

export const leagueIdParamSchema = z.object({
  params: leagueIdParams,
});

const baseLeagueBody = {
  name: z.string().trim().min(1, 'Name is required'),
  type: z.string().trim().optional(),
  logo: z.string().trim().optional(),
};

export const createLeagueSchema = z.object({
  body: z.object({
    id: z.coerce.number().int().positive('League id must be positive'),
    ...baseLeagueBody,
  }),
});

export const updateLeagueSchema = z.object({
  params: leagueIdParams,
  body: z
    .object({
      name: baseLeagueBody.name.optional(),
      type: baseLeagueBody.type,
      logo: baseLeagueBody.logo,
    })
    .refine((data) => data.name !== undefined || data.type !== undefined || data.logo !== undefined, {
      message: 'Provide at least one field to update',
      path: ['body'],
    }),
});

export const searchLeaguesSchema = z.object({
  query: z.object({
    name: z.string().trim().min(1, 'League name is required'),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
});
