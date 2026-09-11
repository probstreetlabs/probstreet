import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.url(),

	FRONTEND_URL: z.url(),
	STREAM_SERVICE_URL: z.url(),

	WORKER_SECRET: z.string().min(1),

	AGENTMAIL_INBOX: z.email(),
	AGENTMAIL_API_KEY: z.string().min(1),

	ON_CALL_ENGINEER_MAIL: z.email(),

	FIREBASE_SERVER_KEY: z.string().min(1),
});

export type ENV_CONFIG = z.infer<typeof envSchema>;

export function validateEnv(env: unknown): ENV_CONFIG {
	const parsed = envSchema.safeParse(env);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((i) => `  • ${i.path.join('.')}: ${i.message}`)
			.join('\n');
		throw new Error(`Invalid environment variables:\n${issues}`);
	}
	return parsed.data;
}
