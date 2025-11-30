import 'dotenv/config';
import { QueueScheduler, Worker } from 'bullmq';
import { performTeamImport } from '../services/teams.service.js';
import { logger } from '../../../common/logger.js';
import { getTeamImportQueueConnection } from '../queues/teamImport.queue.js';

const queueName = 'kickoffhub-imports';
const connection = getTeamImportQueueConnection();

const scheduler = new QueueScheduler(queueName, connection);

scheduler
  .waitUntilReady()
  .then(() => logger.info('Import queue scheduler is ready'))
  .catch((err) => {
    logger.error({ err }, 'Failed to initialize queue scheduler');
  });

const worker = new Worker(
  queueName,
  async (job) => {
    if (job.name === 'teams-import') {
      const { leagueId, season } = job.data;
      return performTeamImport({ leagueId, season });
    }

    throw new Error(`Unknown job name: ${job.name}`);
  },
  connection,
);

worker.on('completed', (job, result) => {
  logger.info({ jobId: job.id, name: job.name, result }, 'Import job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, name: job?.name, err }, 'Import job failed');
});

process.on('SIGINT', async () => {
  await worker.close();
  await scheduler.close();
  logger.info('Import worker shut down gracefully');
  process.exit(0);
});
