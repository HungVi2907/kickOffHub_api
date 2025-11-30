import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl
  ? {
      connection: {
        url: redisUrl,
      },
    }
  : null;

export const teamImportQueue = connection
  ? new Queue('kickoffhub-imports', connection)
  : null;

if (!redisUrl) {
  console.warn('REDIS_URL is not set. Team import background jobs are disabled.');
}

export function enqueueTeamImportJob(payload) {
  if (!teamImportQueue) {
    console.warn('Cannot enqueue team import job because Redis is disabled.');
    return null;
  }

  return teamImportQueue.add('teams-import', payload, {
    removeOnComplete: true,
    removeOnFail: 50,
  });
}

export function getTeamImportQueueConnection() {
  if (!connection) {
    throw new Error('Redis is disabled, so the team import queue is unavailable.');
  }

  return connection;
}
