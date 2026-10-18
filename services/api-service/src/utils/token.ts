import crypto from 'crypto';
import { Context } from 'hono';
import { ENV } from '@/config/env';
import { sign, verify } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';

export interface AccessTokenPayload {
	[key: string]: unknown;
	id: string;
	email?: string;
	role: string;
	exp?: number;
}

export const generateAccessToken = async (
	id: string,
	role: string,
	email?: string | null,
): Promise<string> => {
	const payload: AccessTokenPayload = {
		id,
		role,
		...(email && { email }),
		exp: Math.floor(Date.now() / 1000) + Number(ENV.ACCESS_TOKEN_EXPIRY),
	};

	return sign(payload, ENV.ACCESS_TOKEN_SECRET, 'HS256');
};

export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
	return verify(token, ENV.ACCESS_TOKEN_SECRET, 'HS256') as Promise<AccessTokenPayload>;
};

export const generateRefreshTokenString = (): string => {
	return crypto.randomBytes(40).toString('hex');
};

export const hashRefreshToken = (token: string): string => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

export const setAuthCookies = (c: Context, accessToken: string, refreshToken: string) => {
	const cookieDomain = ENV.COOKIE_DOMAIN ? ENV.COOKIE_DOMAIN.trim() : undefined;
	const isProd = process.env.NODE_ENV === 'production';

	setCookie(c, 'accessToken', accessToken, {
		secure: isProd,
		httpOnly: true,
		maxAge: Number(ENV.ACCESS_TOKEN_EXPIRY),
		sameSite: cookieDomain ? 'Lax' : 'Strict',
		domain: cookieDomain,
		path: '/',
	});

	setCookie(c, 'refreshToken', refreshToken, {
		secure: isProd,
		httpOnly: true,
		maxAge: Number(ENV.REFRESH_TOKEN_EXPIRY),
		sameSite: cookieDomain ? 'Lax' : 'Strict',
		domain: cookieDomain,
		path: '/api/v1/auth',
	});
};

export const clearAuthCookies = (c: Context) => {
	const cookieDomain = ENV.COOKIE_DOMAIN ? ENV.COOKIE_DOMAIN.trim() : undefined;
	deleteCookie(c, 'accessToken', { path: '/', domain: cookieDomain });
	deleteCookie(c, 'refreshToken', { path: '/api/v1/auth', domain: cookieDomain });
};
