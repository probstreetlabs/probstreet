import { logger } from '@/libs/logger';
import { getCookie } from 'hono/cookie';
import { prisma } from '@probstreet/database';
import { client } from '@/libs/redis/connection';
import { Context, MiddlewareHandler } from 'hono';
import { verifyAccessToken } from '@/utils/token';
import { hashApiKey, API_KEY_PREFIX } from '@/utils/apiKey';

export const authorization: MiddlewareHandler = async (c: Context, next) => {
	try {
		const apiKeyHeader =
			c.req.header('X-API-Key') ||
			c.req.header('x-api-key') ||
			(c.req.header('Authorization')?.startsWith(`Bearer ${API_KEY_PREFIX}`)
				? c.req.header('Authorization')?.substring(7)
				: undefined);

		if (apiKeyHeader && apiKeyHeader.startsWith(API_KEY_PREFIX)) {
			const keyHash = hashApiKey(apiKeyHeader);
			const cacheKey = `apikey:cache:${keyHash}`;

			const cached = await client.get(cacheKey).catch(() => null);
			if (cached) {
				try {
					const parsed = JSON.parse(cached);

					if (!parsed.isActive) {
						return c.json({ success: false, message: 'API key is deactivated' }, 401);
					}
					if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
						return c.json({ success: false, message: 'API key has expired' }, 401);
					}

					c.set('user', {
						id: parsed.userId,
						email: parsed.email,
						role: parsed.role,
						apiKeyId: parsed.apiKeyId,
						scopes: parsed.scopes,
					});

					(prisma as any).apiKey
						?.update({
							where: { id: parsed.apiKeyId },
							data: { lastUsedAt: new Date() },
						})
						.catch(() => null);

					await next();
					return;
				} catch {}
			}

			const keyRecord = await (prisma as any).apiKey
				?.findUnique({
					where: { keyHash },
					include: { user: true },
				})
				.catch(() => null);

			if (!keyRecord || !keyRecord.isActive) {
				return c.json({ success: false, message: 'Invalid or deactivated API key' }, 401);
			}

			if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
				return c.json({ success: false, message: 'API key has expired' }, 401);
			}

			const userData = {
				userId: keyRecord.userId,
				email: keyRecord.user?.email || null,
				role: keyRecord.user?.role || 'USER',
				apiKeyId: keyRecord.id,
				scopes: keyRecord.scopes || [],
				isActive: keyRecord.isActive,
				expiresAt: keyRecord.expiresAt ? keyRecord.expiresAt.toISOString() : null,
			};

			await client.set(cacheKey, JSON.stringify(userData), 'EX', 300).catch(() => null);

			c.set('user', {
				id: keyRecord.userId,
				email: keyRecord.user?.email,
				role: keyRecord.user?.role || 'USER',
				apiKeyId: keyRecord.id,
				scopes: keyRecord.scopes || [],
			});

			(prisma as any).apiKey
				?.update({
					where: { id: keyRecord.id },
					data: { lastUsedAt: new Date() },
				})
				.catch(() => null);

			await next();
			return;
		}

		let token = getCookie(c, 'accessToken');

		if (!token) {
			const authHeader = c.req.header('Authorization');
			if (authHeader && authHeader.startsWith('Bearer ')) {
				token = authHeader.substring(7);
			}
		}

		if (!token) {
			token = c.req.query('token');
		}

		if (!token) {
			logger.warn('No token found in cookies, Authorization header, or query param');
			return c.json({ success: false, message: 'Unauthorized' }, 401);
		}

		const payload = await verifyAccessToken(token);

		const { id, email, role } = payload;

		c.set('user', { id, email, role });

		await next();
	} catch (error) {
		logger.error({ error }, 'Authentication verification failed');
		return c.json({ success: false, message: 'Invalid or expired token' }, 401);
	}
};
