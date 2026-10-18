import { Context, Next } from 'hono';
import { captureError } from '@/libs/sentry';
import { client } from '@/libs/redis/connection';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

export type RateLimitTier = {
	points: number;
	duration: number;
	blockDuration?: number;
};

export type BlockOptions = {
	points?: number;
	duration?: number;
	blockDuration?: number;
	keyPrefix?: string;

	ipTier?: RateLimitTier;
	apiTier?: RateLimitTier;
	userTier?: RateLimitTier;
};

export type CallerIdentity = {
	key: string;
	tier: 'apiKey' | 'user' | 'ip';
};

export const resolveCallerIdentity = (c: Context): CallerIdentity => {
	const user = c.get('user');

	if (user?.apiKeyId) {
		return { key: `apikey:${user.apiKeyId}`, tier: 'apiKey' };
	}

	if (user?.id) {
		return { key: `user:${user.id}`, tier: 'user' };
	}

	const rawApiKey =
		c.req.header('X-API-Key') ||
		c.req.header('x-api-key') ||
		(c.req.header('Authorization')?.startsWith('Bearer prob_live_')
			? c.req.header('Authorization')?.substring(7).trim()
			: undefined);

	if (rawApiKey && rawApiKey.startsWith('prob_live_')) {
		const keyPrefix = rawApiKey.substring(0, 18);
		return { key: `apikey:${keyPrefix}`, tier: 'apiKey' };
	}

	const clientIp =
		c.req.header('cf-connecting-ip') ||
		c.req.header('x-real-ip') ||
		c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
		c.req.header('host') ||
		'unknown-ip';

	return { key: `ip:${clientIp}`, tier: 'ip' };
};

const limiterCache = new Map<string, RateLimiterRedis>();

const getLimiterInstance = (
	prefix: string,
	points: number,
	duration: number,
	blockDuration?: number,
): RateLimiterRedis => {
	const cacheKey = `${prefix}:${points}:${duration}:${blockDuration || 0}`;
	let limiter = limiterCache.get(cacheKey);

	if (!limiter) {
		limiter = new RateLimiterRedis({
			storeClient: client,
			points,
			duration,
			blockDuration: blockDuration || 0,
			keyPrefix: prefix,
		});
		limiterCache.set(cacheKey, limiter);
	}

	return limiter;
};

export const rateLimiter = ({
	points = 60,
	duration = 60,
	blockDuration = 0,
	keyPrefix = 'ratelimit',
	apiTier,
	userTier,
	ipTier,
}: BlockOptions = {}) => {
	return async (c: Context, next: Next) => {
		const { key, tier } = resolveCallerIdentity(c);

		let tierConfig: RateLimitTier = { points, duration, blockDuration };

		if (tier === 'apiKey') {
			tierConfig = apiTier || {
				points: Math.max(points, 300),
				duration,
				blockDuration,
			};
		} else if (tier === 'user') {
			tierConfig = userTier || {
				points: Math.max(points, 120),
				duration,
				blockDuration,
			};
		} else if (tier === 'ip') {
			tierConfig = ipTier || {
				points,
				duration,
				blockDuration,
			};
		}

		const limiter = getLimiterInstance(
			`${keyPrefix}:${tier}`,
			tierConfig.points,
			tierConfig.duration,
			tierConfig.blockDuration,
		);

		try {
			const res: RateLimiterRes = await limiter.consume(key);

			c.header('X-RateLimit-Limit', String(tierConfig.points));
			c.header('X-RateLimit-Remaining', String(Math.max(0, res.remainingPoints)));
			c.header('X-RateLimit-Reset', String(Math.ceil((Date.now() + res.msBeforeNext) / 1000)));

			await next();
		} catch (_err: unknown) {
			const err = _err as RateLimiterRes;

			if (!err || typeof err.msBeforeNext === 'undefined') {
				captureError(_err, { tags: { controller: 'limiter', action: 'REDIS_ERROR' } });
				await next();
				return;
			}

			const retrySeconds = Math.max(1, Math.ceil(err.msBeforeNext / 1000));

			c.header('Retry-After', String(retrySeconds));
			c.header('X-RateLimit-Limit', String(tierConfig.points));
			c.header('X-RateLimit-Remaining', '0');
			c.header('X-RateLimit-Reset', String(Math.ceil((Date.now() + err.msBeforeNext) / 1000)));

			return c.json(
				{
					success: false,
					message: 'Too many requests. Please wait and try again.',
					retryAfter: retrySeconds,
				},
				429,
			);
		}
	};
};

export const generalLimiter = rateLimiter({
	keyPrefix: 'rl:gen',
	apiTier: { points: 300, duration: 60 },
	userTier: { points: 120, duration: 60 },
	ipTier: { points: 60, duration: 60 },
});

export const orderLimiter = rateLimiter({
	keyPrefix: 'rl:order',
	apiTier: { points: 60, duration: 60 },
	userTier: { points: 60, duration: 60 },
	ipTier: { points: 10, duration: 60 },
});

export const financialLimiter = rateLimiter({
	keyPrefix: 'rl:fin',
	userTier: { points: 20, duration: 60 },
	apiTier: { points: 20, duration: 60 },
	ipTier: { points: 5, duration: 60 },
});

export const interactionLimiter = rateLimiter({
	keyPrefix: 'rl:int',
	userTier: { points: 30, duration: 60 },
	apiTier: { points: 30, duration: 60 },
	ipTier: { points: 10, duration: 60 },
});

export const adminLimiter = rateLimiter({
	keyPrefix: 'rl:adm',
	userTier: { points: 600, duration: 60 },
	apiTier: { points: 600, duration: 60 },
	ipTier: { points: 300, duration: 60 },
});
