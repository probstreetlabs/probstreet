import { Hono } from 'hono';
import {
	getMarketPosition,
	getPortfolioOrders,
	getPortfolioSummary,
	getPortfolioHistory,
	getPortfolioPositions,
} from '@/controllers/portfolio';
import { authorization } from '@/middlewares/authorization';

export const portfolioRoutes = new Hono();

portfolioRoutes.get('/orders', authorization, getPortfolioOrders);
portfolioRoutes.get('/history', authorization, getPortfolioHistory);
portfolioRoutes.get('/summary', authorization, getPortfolioSummary);
portfolioRoutes.get('/positions', authorization, getPortfolioPositions);
portfolioRoutes.get('/position/:marketId', authorization, getMarketPosition);
