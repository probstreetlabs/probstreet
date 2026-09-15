import { logger } from '@/libs/logger';

const checkEnv = (key: string, required: boolean = true, defaultValue: string = '') => {
	const value = Bun.env[key] || defaultValue;

	if (required && !value) {
		logger.error(`Missing required environment variable: ${key}`);
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const ENV = {
	NODE_ENV: checkEnv('NODE_ENV', false, 'development'),

	REDIS_HOST: checkEnv('REDIS_HOST'),
	REDIS_PORT: checkEnv('REDIS_PORT'),

	KAFKA_BROKERS: checkEnv('KAFKA_BROKERS'),

	CLOUDFLARE_ACCOUNT_ID: checkEnv('CLOUDFLARE_ACCOUNT_ID'),
	CLOUDFLARE_API_TOKEN: checkEnv('CLOUDFLARE_API_TOKEN'),
	CLOUDFLARE_QUEUE_ID: checkEnv('CLOUDFLARE_QUEUE_ID'),

	INFLUX_URL: checkEnv('INFLUX_URL'),
	INFLUX_TOKEN: checkEnv('INFLUX_TOKEN'),
	INFLUX_ORG: checkEnv('INFLUX_ORG'),
	INFLUX_BUCKET: checkEnv('INFLUX_BUCKET'),

	SENTRY_DSN: checkEnv('SENTRY_DSN', false),

	NEW_RELIC_API_KEY: checkEnv('NEW_RELIC_API_KEY', false),

	OTEL_EXPORTER_OTLP_ENDPOINT: checkEnv('OTEL_EXPORTER_OTLP_ENDPOINT', false),
};

if ((ENV.NODE_ENV === 'production' || ENV.NODE_ENV === 'staging') && !ENV.SENTRY_DSN) {
	console.error('\nSENTRY_DSN is required in production and staging environments.\n');
	process.exit(1);
}
