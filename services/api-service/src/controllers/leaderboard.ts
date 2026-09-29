import { Context } from 'hono';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { prisma, Prisma } from '@probstreet/database';
import { client as redis } from '@/libs/redis/connection';

export const syncLeaderboardFromDB = async (redisKey: string, startDate?: Date, endDate?: Date) => {
	try {
		logger.info({ redisKey }, 'Hydrating Redis leaderboard from database...');

		const whereClause: any = { type: 'WINNINGS' };

		if (startDate || endDate) {
			whereClause.createdAt = {};
			if (startDate) whereClause.createdAt.gte = startDate;
			if (endDate) whereClause.createdAt.lt = endDate;
		}

		const earnings = await prisma.ledgerEntry.groupBy({
			by: ['toAccount'],
			where: whereClause,
			_sum: { amount: true },
		});

		if (earnings.length === 0) {
			return;
		}

		const pipeline = redis.pipeline();

		pipeline.del(redisKey);

		for (const item of earnings) {
			if (item.toAccount && item._sum.amount) {
				const profit = Number(item._sum.amount);
				if (profit > 0) {
					pipeline.zadd(redisKey, profit, item.toAccount);
				}
			}
		}
		await pipeline.exec();
		if (!redisKey.includes('all_time')) {
			await redis.expire(redisKey, 86400 * 7);
		}

		logger.info({ redisKey, count: earnings.length }, 'Successfully hydrated Redis leaderboard');
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'leaderboard',
				action: 'SYNCLEADERBOARDFROMDB',
			},
		});
		logger.error({ error, redisKey }, 'Failed to hydrate Redis leaderboard from DB');
	}
};

export const getLeaderboard = async (c: Context) => {
	try {
		const timeframe = c.req.query('timeframe') || 'all_time';
		const now = new Date();

		let redisKey = 'leaderboard:all_time';

		let startDate: Date | undefined;
		let endDate: Date | undefined;

		if (timeframe === 'today') {
			const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
			redisKey = `leaderboard:today:${todayStr}`;
			startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			endDate = new Date(startDate.getTime() + 86400000);
		} else if (timeframe === 'monthly') {
			const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			redisKey = `leaderboard:monthly:${yearMonth}`;
			startDate = new Date(now.getFullYear(), now.getMonth(), 1);
			endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		} else if (timeframe === 'weekly') {
			const startOfYear = new Date(now.getFullYear(), 0, 1);
			const weekNum = Math.ceil(
				((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
			);
			redisKey = `leaderboard:weekly:${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
			const day = now.getDay() || 7;
			startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
			endDate = new Date(startDate.getTime() + 7 * 86400000);
		}

		const exists = await redis.exists(redisKey);

		if (!exists) {
			await syncLeaderboardFromDB(redisKey, startDate, endDate);
		}

		const rawResults = await redis.zrevrange(redisKey, 0, 99, 'WITHSCORES');

		const topUsers: { userId: string; score: number }[] = [];

		for (let i = 0; i < rawResults.length; i += 2) {
			const score = parseFloat(rawResults[i + 1]);
			if (score > 0) {
				topUsers.push({
					userId: rawResults[i],
					score,
				});
			}
		}

		const userIds = topUsers.map((u) => u.userId);

		const currentUser = c.get('user');

		if (currentUser?.id && !userIds.includes(currentUser.id)) {
			userIds.push(currentUser.id);
		}

		const users = await prisma.user.findMany({
			where: { id: { in: userIds } },
			select: {
				id: true,
				username: true,
				avatarUrl: true,
				email: true,
			},
		});

		const userMap = new Map(users.map((u) => [u.id, u]));

		const volumeMap = new Map<string, number>();

		if (userIds.length > 0) {
			const tradeVolumes: { userId: string; volume: Prisma.Decimal }[] = await prisma.$queryRaw`
				SELECT 
					"userId", 
					SUM(volume) as volume 
				FROM (
					SELECT maker_id as "userId", (price * quantity) as volume FROM trades WHERE maker_id IN (${Prisma.join(userIds)})
					UNION ALL
					SELECT taker_id as "userId", (price * quantity) as volume FROM trades WHERE taker_id IN (${Prisma.join(userIds)}) AND taker_id != maker_id
				) AS user_trades
				GROUP BY "userId"
			`;

			for (const tv of tradeVolumes) {
				volumeMap.set(tv.userId, Number(tv.volume));
			}
		}

		const leaderboard = topUsers.slice(0, 50).map((entry, index) => {
			const profile = userMap.get(entry.userId);
			const displayName =
				profile?.username || profile?.email?.split('@')[0] || `Trader #${entry.userId.slice(-4)}`;
			const actualVolume = volumeMap.get(entry.userId) || 0;

			return {
				rank: index + 1,
				userId: entry.userId,
				name: displayName,
				username: profile?.username || `trader_${entry.userId.slice(-4)}`,
				avatar: profile?.avatarUrl || null,
				profit: entry.score,
				volume: Math.round(actualVolume * 100) / 100,
			};
		});

		let userRankData: { rank: number | null; profit: number } | null = null;

		if (currentUser?.id) {
			const zeroBasedRank = await redis.zrevrank(redisKey, currentUser.id);
			const scoreStr = await redis.zscore(redisKey, currentUser.id);
			userRankData = {
				rank: zeroBasedRank !== null ? zeroBasedRank + 1 : null,
				profit: scoreStr ? parseFloat(scoreStr) : 0,
			};
		}

		return c.json({
			success: true,
			data: {
				timeframe,
				leaderboard,
				userRank: userRankData,
			},
		});
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'leaderboard',
				action: 'GETLEADERBOARD',
			},
		});
		logger.error({ error }, 'Failed to fetch leaderboard');
		return c.json(
			{
				success: false,
				message: 'Failed to fetch leaderboard',
			},
			500,
		);
	}
};
