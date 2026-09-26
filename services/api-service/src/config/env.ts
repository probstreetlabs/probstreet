import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),

	PORT: z.string().min(1),

	ACCESS_TOKEN_SECRET: z.string().min(1),
	REFRESH_TOKEN_SECRET: z.string().min(1),
	ACCESS_TOKEN_EXPIRY: z.string().min(1),
	REFRESH_TOKEN_EXPIRY: z.string().min(1),

	BACKEND_ORIGIN: z.url(),
	CORS_ORIGIN: z.string().min(1),
	FRONTEND_URL: z.url(),

	REDIS_HOST: z.string().min(1),
	REDIS_PORT: z.string().min(1),

	REDIS_PUBSUB_HOST: z.string().min(1),
	REDIS_PUBSUB_PORT: z.string().min(1),

	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	GOOGLE_REDIRECT_URI: z.url(),

	DISCORD_CLIENT_ID: z.string().min(1),
	DISCORD_CLIENT_SECRET: z.string().min(1),
	DISCORD_REDIRECT_URI: z.url(),

	TELEGRAM_BOT_TOKEN: z.string().min(1),

	CLOUDINARY_URL: z.url(),
	SNAPSHOT_DB_URL: z.url(),

	CASHFREE_CLIENT_ID: z.string().min(1),
	CASHFREE_CLIENT_SECRET: z.string().min(1),
	CASHFREE_PAYOUT_CLIENT_ID: z.string().min(1),
	CASHFREE_PAYOUT_CLIENT_SECRET: z.string().min(1),
	CASHFREE_VERIFICATION_CLIENT_ID: z.string(),
	CASHFREE_VERIFICATION_CLIENT_SECRET: z.string(),

	CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
	CLOUDFLARE_API_TOKEN: z.string().min(1),
	CLOUDFLARE_QUEUE_ID: z.string().min(1),

	INFLUX_URL: z.url(),
	INFLUX_TOKEN: z.string().min(1),
	INFLUX_ORG: z.string().min(1),
	INFLUX_BUCKET: z.string().min(1),

	GMAIL_USER: z.email(),
	GMAIL_APP_PASSWORD: z.string().min(1),

	TAVILY_API_KEY: z.string().min(1),

	GROQ_API_KEY: z.string().min(1),

	FOOTBALL_DATA_API_KEY: z.string().min(1),

	FINNHUB_API_KEY: z.string().min(1),

	IS_KYC_PROVIDER_ENABLED: z.string().default('false'),

	SENTRY_DSN: z.url(),

	NEW_RELIC_API_KEY: z.string().min(1),

	OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),

	OPENROUTER_API_KEY: z.string().optional(),
	USE_JEV_ORACLE_RESOLVER: z.string().default('false'),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
	const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
	console.error(`\nInvalid environment variables:\n${issues}\n`);
	process.exit(1);
}

export const ENV = parsed.data;
