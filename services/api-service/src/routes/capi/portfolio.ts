import { Hono } from 'hono';
import {
	getMarketPosition,
	getPortfolioOrders,
	getPortfolioSummary,
	getPortfolioHistory,
	getPortfolioPositions,
} from '@/controllers/portfolio';
import { requireScope } from '@/middlewares/scope';
import { generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';

export const portfolioRoutes = new Hono();

portfolioRoutes.use('/*', generalLimiter);

portfolioRoutes.get('/orders', authorization, requireScope('orders:read'), getPortfolioOrders);
portfolioRoutes.get('/history', authorization, requireScope('orders:read'), getPortfolioHistory);
portfolioRoutes.get('/summary', authorization, requireScope('wallet:read'), getPortfolioSummary);
portfolioRoutes.get(
	'/positions',
	authorization,
	requireScope('wallet:read', 'orders:read'),
	getPortfolioPositions,
);
portfolioRoutes.get(
	'/position/:marketId',
	authorization,
	requireScope('wallet:read', 'orders:read'),
	getMarketPosition,
);
