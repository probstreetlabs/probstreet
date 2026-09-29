import Redis from 'ioredis';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';

export const redisSubscriber = new Redis({
	host: ENV.REDIS_HOST,
	port: Number(ENV.REDIS_PORT),
	db: Number(ENV.REDIS_DB),
});

redisSubscriber.on('connect', () => {
	logger.info(`Redis instance connected successfully`);
});

redisSubscriber.on('error', (err) => {
	captureError(err, { tags: { controller: 'redis_client', action: 'CONNECT' } });
	logger.error(`Failed to connect to Redis instance : ${err.message}`);
});
