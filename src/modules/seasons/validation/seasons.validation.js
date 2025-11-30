import { z } from 'zod';

const seasonValue = z.coerce.number().int('Season must be an integer');

export const createSeasonSchema = z.object({
  body: z.object({
    season: seasonValue,
  }),
});

export const deleteSeasonSchema = z.object({
  params: z.object({
    season: seasonValue,
  }),
});
