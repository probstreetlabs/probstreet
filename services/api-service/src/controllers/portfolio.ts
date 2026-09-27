import { Context } from 'hono';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { prisma } from '@probstreet/database';
import { client as redis } from '@/libs/redis/connection';

export const getMarketPosition = async (c: Context) => {
	try {
		const user = c.get('user');

		if (!user) {
			return c.json({ success: false, message: 'Unauthorized' }, 401);
		}

		const marketId = c.req.param('marketId');

		if (!marketId) {
			return c.json({ success: false, message: 'Market ID required' }, 400);
		}

		const [position, activeOrders] = await Promise.all([
			prisma.position.findFirst({
				where: { userId: user.id, marketId },
			}),
			prisma.order.findMany({
				where: {
					userId: user.id,
					marketId,
					status: { in: ['PENDING', 'PARTIAL'] },
				},
				orderBy: { createdAt: 'desc' },
				take: 20,
			}),
		]);

		return c.json({
			success: true,
			data: {
				position: position || null,
				activeOrders,
			},
		});
	} catch (error: any) {
		captureError(error, {
			tags: {
				controller: 'portfolio',
				action: 'GETMARKETPOSITION',
			},
		});
		logger.error({ context: 'GET_MARKET_POSITION', message: error.message });
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
};

export const getPortfolioSummary = async (c: Context) => {
	try {
		const user = c.get('user');

		if (!user)
			return c.json(
				{
					success: false,
					message: 'Unauthorized',
				},
				401,
			);

		const result: any = await prisma.$queryRaw`
			SELECT
				COALESCE(SUM(p.yes_invested + p.no_invested), 0) as "totalInvested",
				COALESCE(SUM((p.yes_quantity + p.yes_locked) * m.yes_price + (p.no_quantity + p.no_locked) * m.no_price), 0) as "totalCurrentValue"
			FROM positions p
			JOIN markets m ON p.market_id = m.id
			WHERE p.user_id = ${user.id} AND m.status = 'OPEN'
		`;

		const totalInvested = Number(result[0].totalInvested);
		const totalCurrentValue = Number(result[0].totalCurrentValue);

		let netProfit = 0;
		try {
			const score = await redis.zscore('leaderboard:all_time', user.id);
			netProfit = score ? parseFloat(score) : 0;
		} catch (err) {
			logger.warn({ context: 'GET_PORTFOLIO_SUMMARY', message: 'Failed to fetch netProfit' });
		}

		const unrealizedPnL = totalCurrentValue - totalInvested;
		const totalPnL = netProfit;

		const userRecord = await prisma.user.findUnique({
			where: { id: user.id },
			include: { wallet: true },
		});
		const walletBalance = Number(userRecord?.wallet?.balance || 0);

		return c.json({
			success: true,
			data: {
				totalInvested,
				totalCurrentValue,
				totalPnL,
				unrealizedPnL,
				walletBalance,
			},
		});
	} catch (error: any) {
		captureError(error, { tags: { controller: 'portfolio', action: 'SUMMARY' } });
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
};

export const getPortfolioPositions = async (c: Context) => {
	try {
		const user = c.get('user');

		if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

		const positions = await prisma.position.findMany({
			where: { userId: user.id },
			include: {
				market: {
					select: {
						id: true,
						title: true,
						symbol: true,
						thumbnail: true,
						status: true,
						result: true,
						yesPrice: true,
						noPrice: true,
					},
				},
			},
		});

		return c.json({ success: true, data: positions });
	} catch (error: any) {
		captureError(error, { tags: { controller: 'portfolio', action: 'POSITIONS' } });
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
};

export const getPortfolioOrders = async (c: Context) => {
	try {
		const user = c.get('user');

		if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

		const ordersPage = parseInt(c.req.query('ordersPage') || '1');
		const take = 10;
		const skip = (ordersPage - 1) * take;

		const activeOrders = await prisma.order.findMany({
			where: {
				userId: user.id,
				status: { in: ['PENDING', 'PARTIAL'] },
			},
			include: {
				market: {
					select: { id: true, title: true, symbol: true },
				},
			},
			orderBy: { createdAt: 'desc' },
			take,
			skip,
		});

		return c.json({ success: true, data: activeOrders });
	} catch (error: any) {
		captureError(error, { tags: { controller: 'portfolio', action: 'ORDERS' } });
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
};

export const getPortfolioHistory = async (c: Context) => {
	try {
		const user = c.get('user');

		if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

		const historyPage = parseInt(c.req.query('historyPage') || '1');
		const take = 10;
		const skip = (historyPage - 1) * take;

		const recentActivity = await prisma.order.findMany({
			where: {
				userId: user.id,
				status: { not: 'FAILED' },
			},
			include: {
				market: {
					select: { id: true, title: true, symbol: true, thumbnail: true },
				},
			},
			orderBy: { createdAt: 'desc' },
			take,
			skip,
		});

		return c.json({ success: true, data: recentActivity });
	} catch (error: any) {
		captureError(error, { tags: { controller: 'portfolio', action: 'HISTORY' } });
		return c.json({ success: false, message: 'Internal server error' }, 500);
	}
};
