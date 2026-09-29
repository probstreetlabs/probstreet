import Redis from 'ioredis';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';

export const client = new Redis({
	host: ENV.REDIS_HOST,
	port: Number(ENV.REDIS_PORT),
	db: 0,
});

client.on('connect', () => {
	logger.info('Redis instance connected successfully');
});

client.on('error', (error) => {
	captureError(error || new Error('Redis connection error'), {
		tags: { action: 'REDIS_ERROR', controller: 'redis_client' },
	});
	logger.error(`Failed to connect to Redis instance : ${error.message}`);
});

export const pubsubClient = new Redis({
	host: ENV.REDIS_PUBSUB_HOST,
	port: Number(ENV.REDIS_PUBSUB_PORT),
	db: 0,
});

pubsubClient.on('connect', () => {
	logger.info('Redis PubSub instance connected successfully');
});

pubsubClient.on('error', (error) => {
	captureError(error || new Error('Redis pubsub connection error'), {
		tags: { action: 'REDIS_PUBSUB_ERROR', controller: 'redis_pubsub' },
	});
	logger.error(`Failed to connect to Redis PubSub instance : ${error.message}`);
});
