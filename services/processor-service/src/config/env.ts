import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),

	REDIS_HOST: z.string().min(1),
	REDIS_PORT: z.string().min(1),

	KAFKA_BROKERS: z.string().min(1),

	CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
	CLOUDFLARE_API_TOKEN: z.string().min(1),
	CLOUDFLARE_QUEUE_ID: z.string().min(1),

	INFLUX_URL: z.url(),
	INFLUX_TOKEN: z.string().min(1),
	INFLUX_ORG: z.string().min(1),
	INFLUX_BUCKET: z.string().min(1),

	SENTRY_DSN: z.url(),

	NEW_RELIC_API_KEY: z.string().min(1),

	OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
	const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
	console.error(`\nInvalid environment variables:\n${issues}\n`);
	process.exit(1);
}

export const ENV = parsed.data;
