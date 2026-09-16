import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),

	PORT: z.string().min(1).default('8004'),

	REDIS_DB: z.string().min(1).default('0'),
	REDIS_HOST: z.string().min(1).default('127.0.0.1'),
	REDIS_PORT: z.string().min(1).default('6379'),

	WORKER_SECRET: z.string().min(1),

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
