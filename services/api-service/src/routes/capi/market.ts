import { Hono } from 'hono';
import { isAdmin } from '@/middlewares/isAdmin';
import { requireScope } from '@/middlewares/scope';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';
import {
	createMarket,
	addLiquidity,
	getAllMarket,
	getMarketDetails,
	getMarketsByCategory,
	resolveMarket,
	searchMarkets,
	getMarketKlines,
	getMarketTrades,
	getMarketStats,
	generatePresignedUrlRoute,
	splitShares,
	mergeShares,
	getMarketNews,
	getMarketLiveStatus,
	getMarketProxyKlines,
	getMarketComments,
	postMarketComment,
	deleteMarketComment,
} from '@/controllers/market';
import { optionalAuthorization } from '@/middlewares/optionalAuthorization';
import { generalLimiter, orderLimiter, interactionLimiter } from '@/middlewares/limiter';

export const marketRoutes = new Hono();

marketRoutes.get('/', generalLimiter, getAllMarket);
marketRoutes.get('/category/:categoryParam', generalLimiter, getMarketsByCategory);
marketRoutes.post('/create', authorization, isAdmin, createMarket);
marketRoutes.post('/liquidity-add', authorization, idempotency, addLiquidity);
marketRoutes.post('/resolve', authorization, isAdmin, idempotency, resolveMarket);
marketRoutes.post('/generate-url', authorization, isAdmin, generatePresignedUrlRoute);
marketRoutes.post(
	'/:symbol/split',
	authorization,
	requireScope('orders:write'),
	orderLimiter,
	idempotency,
	splitShares,
);
marketRoutes.post(
	'/:symbol/merge',
	authorization,
	requireScope('orders:write'),
	orderLimiter,
	idempotency,
	mergeShares,
);

marketRoutes.get('/search', generalLimiter, searchMarkets);
marketRoutes.get('/:symbol', generalLimiter, getMarketDetails);
marketRoutes.get('/:symbol/live', generalLimiter, getMarketLiveStatus);
marketRoutes.get('/:symbol/klines', generalLimiter, getMarketKlines);
marketRoutes.get('/:symbol/proxy-klines', generalLimiter, getMarketProxyKlines);
marketRoutes.get('/:symbol/trades', generalLimiter, getMarketTrades);
marketRoutes.get('/:symbol/stats', generalLimiter, getMarketStats);
marketRoutes.get('/:symbol/news', generalLimiter, getMarketNews);

marketRoutes.get('/:symbol/comments', optionalAuthorization, generalLimiter, getMarketComments);
marketRoutes.post('/:symbol/comments', authorization, interactionLimiter, postMarketComment);
marketRoutes.delete(
	'/:symbol/comments/:commentId',
	authorization,
	interactionLimiter,
	deleteMarketComment,
);
