import { Hono } from 'hono';
import {
	initSignin,
	verifyOtp,
	googleCallback,
	discordCallback,
	telegramCallback,
	logout,
	refresh,
	getMe,
	getSessions,
	logoutAll,
	getWsToken,
} from '@/controllers/auth';
import { authorization } from '@/middlewares/authorization';
import { rateLimiter, generalLimiter } from '@/middlewares/limiter';

export const authRoutes = new Hono();

const authLimiter = rateLimiter({
	keyPrefix: 'rl:auth:init',
	points: 10,
	duration: 300,
	blockDuration: 300,
});

const loginLimiter = rateLimiter({
	keyPrefix: 'rl:auth:otp',
	points: 15,
	duration: 300,
	blockDuration: 600,
});

const oauthLimiter = rateLimiter({
	keyPrefix: 'rl:auth:oauth',
	points: 30,
	duration: 300,
});

authRoutes.post('/init-signin', authLimiter, initSignin);
authRoutes.post('/verify-otp', loginLimiter, verifyOtp);

authRoutes.post('/google/callback', oauthLimiter, googleCallback);
authRoutes.post('/discord/callback', oauthLimiter, discordCallback);
authRoutes.post('/telegram/callback', oauthLimiter, telegramCallback);

authRoutes.post('/logout', logout);
authRoutes.use('/*', authorization);
authRoutes.post('/refresh', generalLimiter, refresh);

authRoutes.get('/me', generalLimiter, getMe);
authRoutes.get('/ws-token', generalLimiter, getWsToken);
authRoutes.get('/sessions', generalLimiter, getSessions);
authRoutes.post('/logout-all', generalLimiter, logoutAll);
