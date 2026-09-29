import Redis from 'ioredis';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';

export const redisPublisher = new Redis({
	host: ENV.REDIS_HOST,
	port: Number(ENV.REDIS_PORT),
});

redisPublisher.on('connect', () => {
	logger.info('Redis instance connected successfully');
});

redisPublisher.on('error', (err) => {
	logger.error(err, 'Failed to connect to Redis instance');
	captureError(err || new Error('Failed to connect to Redis instance'), {
		tags: { action: 'REDIS_ERROR', controller: 'redis_client' },
	});
});
