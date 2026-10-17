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
} from '@/controllers/auth';
import { rateLimiter, generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';

export const authRoutes = new Hono();

// 10 OTP requests per 5 minutes per IP to prevent email bombing
const authLimiter = rateLimiter({
	keyPrefix: 'rl:auth:init',
	points: 10,
	duration: 300,
	blockDuration: 300,
});

// 15 OTP verification attempts per 5 minutes per IP with 10-minute block to prevent brute-force
const loginLimiter = rateLimiter({
	keyPrefix: 'rl:auth:otp',
	points: 15,
	duration: 300,
	blockDuration: 600,
});

// 30 OAuth callbacks per 5 minutes per IP
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
authRoutes.get('/sessions', generalLimiter, getSessions);
authRoutes.post('/logout-all', generalLimiter, logoutAll);
