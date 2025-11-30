import { z } from 'zod';

const positiveInt = z.coerce.number().int().positive('Giá trị phải là số nguyên dương');

const mappingBody = z.object({
  playerId: positiveInt,
  leagueId: positiveInt,
  teamId: positiveInt,
  season: positiveInt,
});

const identifiers = z.object({
  playerId: positiveInt,
  leagueId: positiveInt,
  teamId: positiveInt,
  season: positiveInt,
});

export const createMappingSchema = z.object({
  body: mappingBody,
});

export const updateMappingSchema = z.object({
  params: identifiers,
  body: mappingBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật',
    path: ['body'],
  }),
});

export const deleteMappingSchema = z.object({
  params: identifiers,
});

export const listPlayersQuerySchema = z.object({
  query: z.object({
    leagueId: positiveInt,
    teamId: positiveInt,
    season: positiveInt,
  }),
});
