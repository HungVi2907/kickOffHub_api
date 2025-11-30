import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
const redisDisabledMessage = 'Redis is disabled. Set REDIS_URL to enable caching/queues.';

function createNoopRedisClient() {
  return {
    isOpen: false,
    async connect() {
      console.warn(redisDisabledMessage);
    },
    async disconnect() {},
    async quit() {},
    async get() {
      return null;
    },
    async set() {
      return null;
    },
    async del() {
      return 0;
    },
    async keys() {
      return [];
    },
    on() {
      return this;
    },
  };
}

export const redisClient = redisUrl
  ? createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy(retries) {
          if (retries > 8) {
            return new Error('Redis reconnect attempts exhausted');
          }
          return Math.min(retries * 50, 1000);
        },
      },
    })
  : createNoopRedisClient();

if (!redisUrl) {
  console.warn('REDIS_URL is not set. Redis-dependent features are disabled for this run.');
}

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

let isReady = false;

redisClient.on('ready', () => {
  isReady = true;
  console.log('Redis connected');
});

export async function connectRedis() {
  if (!redisUrl) {
    return redisClient;
  }

  if (isReady) {
    return redisClient;
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

export function getRedisStatus() {
  return {
    isReady,
    isOpen: redisClient.isOpen,
  };
}

export default redisClient;
