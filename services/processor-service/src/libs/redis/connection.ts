import Redis from 'ioredis';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';

export const redisPublisher = new Redis({
	host: ENV.REDIS_HOST,
	port: Number(ENV.REDIS_PORT),
});

redisPublisher.on('connect', () => {
	logger.info('Processor connected to Redis Pub/Sub');
});

redisPublisher.on('error', (err) => {
	logger.error(err, 'Failed to connect to Redis');
});
