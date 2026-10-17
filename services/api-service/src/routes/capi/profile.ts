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

profileRoutes.use('/*', generalLimiter);

profileRoutes.get('/get', authorization, getProfile);
profileRoutes.patch('/update', authorization, updateProfile);

profileRoutes.post('/watchlist', authorization, addToWatchlist);
profileRoutes.delete('/watchlist/:marketId', authorization, removeFromWatchlist);
profileRoutes.get('/watchlist', authorization, getWatchlist);
profileRoutes.get('/trades', authorization, getUserTrades);

profileRoutes.get('/:username', getPublicProfile);
