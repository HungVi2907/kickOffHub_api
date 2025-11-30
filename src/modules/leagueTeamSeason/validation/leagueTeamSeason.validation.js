import { z } from 'zod';

const positiveIntString = z.string().regex(/^[1-9]\d*$/, 'Must be a positive integer');

export const listQuerySchema = z.object({
  query: z.object({
    leagueId: positiveIntString.optional(),
    teamId: positiveIntString.optional(),
    season: positiveIntString.optional(),
  }),
});

export const leagueSeasonParamsSchema = z.object({
  params: z.object({
    leagueId: positiveIntString,
    season: positiveIntString,
  }),
});

export const leagueTeamSeasonParamsSchema = z.object({
  params: z.object({
    leagueId: positiveIntString,
    teamId: positiveIntString,
    season: positiveIntString,
  }),
});
