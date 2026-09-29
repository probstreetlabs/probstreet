import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { Market } from '@probstreet/database';
import { prisma } from '@probstreet/database';
import { pushToQueue } from '@/libs/redis/queue';
import { sendNotification } from '@/libs/notification/dispatcher';

export async function tryAcquireResolve(marketId: string): Promise<Market | null> {
	const result = await prisma.market.updateMany({
		where: { id: marketId, status: 'OPEN' },
		data: { status: 'RESOLVING' as any },
	});

	if (result.count === 0) return null;

	return prisma.market.findUnique({ where: { id: marketId } });
}

export async function completeResolve(
	market: Market,
	verdict: 'YES' | 'NO',
	reason: string,
): Promise<boolean> {
	logger.info(
		{ marketId: market.id, symbol: market.symbol, verdict, reason },
		'Completing market resolution',
	);

	const queueResponse = await pushToQueue('RESOLVE_MARKET', {
		symbol: market.symbol,
		result: verdict,
	});

	if (!queueResponse.success) {
		logger.error(
			{ marketId: market.id, response: queueResponse },
			'Failed to push to queue. Rolling back to OPEN.',
		);
		captureError(
			new Error(`Failed to resolve market in engine: ${queueResponse.message || 'Unknown error'}`),
			{
				tags: {
					controller: 'atomic-resolve',
					action: 'RESOLVE_MARKET_FAIL',
					marketId: market.id,
					symbol: market.symbol,
				},
				contexts: {
					queueResponse,
				},
			},
		);

		await prisma.market.update({
			where: { id: market.id },
			data: { status: 'OPEN' },
		});
		return false;
	}

	await prisma.market.update({
		where: { id: market.id },
		data: { status: 'CLOSED', oracleStatus: 'RESOLVED' },
	});

	await Promise.all([
		prisma.oracleLog.create({
			data: {
				marketId: market.id,
				action: 'RESOLVE',
				resolver: 'deterministic_binance',
				verdict,
				reasoning: reason,
				rubricScore: 100,
			},
		}),
		sendNotification({
			type: 'oracle.resolved',
			data: {
				marketId: market.id,
				marketTitle: market.title,
				symbol: market.symbol,
				verdict,
				score: 100,
				source: 'deterministic_binance',
				reasoning: reason,
			},
		}),
	]);

	return true;
}
