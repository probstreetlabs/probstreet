import crypto from 'crypto';
import { verify } from 'hono/jwt';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { prisma } from '@probstreet/database';

export interface AuthenticatedUser {
	id: string;
	role?: string;
	apiKeyId?: string;
	scopes?: string[];
	isApiKey?: boolean;
}

export const API_KEY_PREFIX = 'prob_live_';

export const hashApiKey = (apiKey: string): string => {
	return crypto.createHash('sha256').update(apiKey).digest('hex');
};

const parseCookie = (cookieHeader?: string): Record<string, string> => {
	if (!cookieHeader) return {};
	const cookies: Record<string, string> = {};
	cookieHeader.split(';').forEach((cookie) => {
		const [rawName, ...rest] = cookie.split('=');
		const name = rawName?.trim();
		if (name) {
			cookies[name] = decodeURIComponent(rest.join('=').trim());
		}
	});
	return cookies;
};

export const verifyStreamAuth = async (credentials: {
	apiKey?: string;
	token?: string;
	cookie?: string;
}): Promise<AuthenticatedUser | null> => {
	try {
		let apiKey = credentials.apiKey;

		if (!apiKey && credentials.token?.startsWith(API_KEY_PREFIX)) {
			apiKey = credentials.token;
		}

		if (apiKey && apiKey.startsWith(API_KEY_PREFIX)) {
			const keyHash = hashApiKey(apiKey);
			const keyRecord = await (prisma as any).apiKey
				?.findUnique({
					where: { keyHash },
					include: { user: true },
				})
				.catch((err: any) => {
					logger.error('Error fetching API key in stream service: ' + err?.message);
					return null;
				});

			if (!keyRecord || !keyRecord.isActive) {
				return null;
			}

			if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
				return null;
			}

			(prisma as any).apiKey
				?.update({
					where: { id: keyRecord.id },
					data: { lastUsedAt: new Date() },
				})
				.catch(() => null);

			return {
				id: keyRecord.userId,
				role: keyRecord.user?.role || 'USER',
				apiKeyId: keyRecord.id,
				scopes: keyRecord.scopes || [],
				isApiKey: true,
			};
		}

		let token = credentials.token;

		if (token?.startsWith('Bearer ')) {
			token = token.substring(7).trim();
		}

		if (!token && credentials.cookie) {
			const cookies = parseCookie(credentials.cookie);
			token = cookies['accessToken'];
		}

		if (token) {
			const decoded = (await verify(token, ENV.ACCESS_TOKEN_SECRET, 'HS256').catch(() => null)) as {
				id?: string;
				role?: string;
				exp?: number;
			} | null;

			if (decoded && decoded.id) {
				if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
					return null;
				}

				return {
					id: decoded.id,
					role: decoded.role || 'USER',
					isApiKey: false,
				};
			}
		}

		return null;
	} catch (err: any) {
		logger.error('Stream auth verification exception: ' + err?.message);
		return null;
	}
};
