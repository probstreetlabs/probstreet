import { Hono } from 'hono';
import {
	getProfile,
	updateProfile,
	addToWatchlist,
	removeFromWatchlist,
	getWatchlist,
	getUserTrades,
	getPublicProfile,
} from '@/controllers/profile';
import { generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';

export const profileRoutes = new Hono();

profileRoutes.get('/get', authorization, generalLimiter, getProfile);
profileRoutes.patch('/update', authorization, generalLimiter, updateProfile);

profileRoutes.post('/watchlist', authorization, generalLimiter, addToWatchlist);
profileRoutes.delete('/watchlist/:marketId', authorization, generalLimiter, removeFromWatchlist);
profileRoutes.get('/watchlist', authorization, generalLimiter, getWatchlist);
profileRoutes.get('/trades', authorization, generalLimiter, getUserTrades);

profileRoutes.get('/:username', generalLimiter, getPublicProfile);
