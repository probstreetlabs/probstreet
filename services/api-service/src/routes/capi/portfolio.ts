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

portfolioRoutes.get(
	'/orders',
	authorization,
	requireScope('orders:read'),
	generalLimiter,
	getPortfolioOrders,
);
portfolioRoutes.get(
	'/history',
	authorization,
	requireScope('orders:read'),
	generalLimiter,
	getPortfolioHistory,
);
portfolioRoutes.get(
	'/summary',
	authorization,
	requireScope('wallet:read'),
	generalLimiter,
	getPortfolioSummary,
);
portfolioRoutes.get(
	'/positions',
	authorization,
	requireScope('wallet:read', 'orders:read'),
	generalLimiter,
	getPortfolioPositions,
);
portfolioRoutes.get(
	'/position/:marketId',
	authorization,
	requireScope('wallet:read', 'orders:read'),
	generalLimiter,
	getMarketPosition,
);
