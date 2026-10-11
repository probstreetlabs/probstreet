import { Context, Next } from 'hono';
import { client } from '@/libs/redis/connection';
import { logger } from '@/libs/logger';

/**
 * Concurrency Lock & Idempotency Middleware.
 *
 * Prevents duplicate orders, double-spending, and concurrent submissions while in-flight.
 * Does NOT cache full response bodies in Redis.
 *
 * Flow:
 *  1. Reads `Idempotency-Key` (or `idempotency-key`) header (UUID).
 *  2. If missing or user not authenticated, passes through transparently.
 *  3. Atomically acquires in-flight lock: `SET idempotency:${userId}:${key} "PROCESSING" EX 30 NX`.
 *  4. If key exists:
 *     - If "PROCESSING": returns 409 Conflict ("Request is currently being processed").
 *     - If "COMPLETED": returns 409 Conflict ("Duplicate request: this operation was already completed").
 *  5. Executes handler via `await next()`.
 *  6. Cleanup:
 *     - If 2xx success: marks key as "COMPLETED" with a short 30-second TTL (no response body stored).
 *     - If error / non-2xx: deletes key immediately so user can retry.
 */

export const idempotency = async (c: Context, next: Next) => {
	const idempotencyKey = c.req.header('Idempotency-Key') || c.req.header('idempotency-key');

	if (!idempotencyKey) {
		await next();
		return;
	}

	const user = c.get('user');
	const userId = user?.id || (user as any)?.id;

	if (!userId) {
		await next();
		return;
	}

	const redisKey = `idempotency:${userId}:${idempotencyKey}`;

	try {
		// Atomically try to acquire in-flight lock (30s safety TTL)
		const setRes = await client.set(redisKey, 'PROCESSING', 'EX', 30, 'NX');
		const acquired = setRes === 'OK';

		if (!acquired) {
			const existingState = await client.get(redisKey).catch(() => null);
			if (existingState === 'COMPLETED') {
				return c.json(
					{
						success: false,
						error: 'Duplicate request. This operation has already been completed.',
					},
					409,
				);
			}
			return c.json(
				{
					success: false,
					error: 'Request is currently being processed. Please wait.',
				},
				409,
			);
		}
	} catch (redisErr) {
		// If Redis is unreachable, log warning and let request pass through
		logger.warn({ err: redisErr }, 'Redis error in idempotency lock acquisition, bypassing');
		await next();
		return;
	}

	try {
		await next();

		// If successful (2xx), keep a lightweight COMPLETED flag for 30s to reject immediate retries
		if (c.res && c.res.status >= 200 && c.res.status < 300) {
			await client.set(redisKey, 'COMPLETED', 'EX', 30).catch(() => null);
		} else {
			// On 4xx / 5xx, release lock immediately so user can retry
			await client.del(redisKey).catch(() => null);
		}
	} catch (err) {
		// On exception, release lock immediately so user can retry
		await client.del(redisKey).catch(() => null);
		throw err;
	}
};
