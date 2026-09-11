import cron from 'node-cron';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { prisma } from '@probstreet/database';
import { tryAcquireResolve, completeResolve } from '@/libs/crypto/atomic-resolve';

export async function checkAndResolveStocksMarkets() {
	if (!ENV.FINNHUB_API_KEY) return;

	try {
		const now = new Date();

		const markets = await prisma.market.findMany({
			where: {
				status: 'OPEN',
				resolutionMode: 'AUTOMATIC',
			},
			include: { category: true },
		});

		for (const market of markets) {
			const categoryName = (market.category?.categoryName || '').toLowerCase();
			const config = (market.oracleConfig as any) || {};

			const isStocks =
				categoryName.includes('stocks') ||
				categoryName.includes('finance') ||
				config.resolver === 'stock_price';

			if (!isStocks) continue;

			const targetValue = config.targetValue ? Number(config.targetValue) : undefined;
			const condition = (config.condition || 'gte').toLowerCase();

			if (targetValue === undefined || isNaN(targetValue)) continue;

			let currentPrice: number | null = null;
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 4000);

				let finnhubSymbol = 'AAPL'; // default fallback
				if (market.sourceOfTruth?.includes('finnhub.io')) {
					const urlObj = new URL(market.sourceOfTruth);
					finnhubSymbol = urlObj.searchParams.get('symbol') || finnhubSymbol;
				} else {
					const match = market.title.match(/\b([A-Z]{2,5}(?:\.[A-Z]{2})?)\b/);
					if (match) finnhubSymbol = match[1];
				}

				const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${ENV.FINNHUB_API_KEY}`;

				const res = await fetch(url, { signal: controller.signal });
				clearTimeout(timeoutId);

				if (res.ok) {
					const data = (await res.json()) as any;
					if (data && data.c !== 0 && data.c !== undefined) {
						currentPrice = parseFloat(data.c);
					}
				}
			} catch (err: any) {
				captureError(err, {
					tags: {
						controller: 'cron',
						action: 'RESOLVE_SINGLE_MARKET_STOCKS',
						marketId: market.id,
						symbol: market.symbol,
					},
				});
				logger.warn(
					{ symbol: market.symbol, err: err.message },
					'Failed to fetch Finnhub quote in stocks resolver',
				);
				continue;
			}

			if (currentPrice === null) continue;

			// Update tracked high/low internally
			let trackedHigh = currentPrice;
			let trackedLow = currentPrice;

			if (market.trackedHigh) {
				trackedHigh = Math.max(parseFloat(market.trackedHigh.toString()), currentPrice);
			}
			if (market.trackedLow) {
				trackedLow = Math.min(parseFloat(market.trackedLow.toString()), currentPrice);
			}

			await prisma.market.update({
				where: { id: market.id },
				data: {
					trackedHigh,
					trackedLow,
				},
			});

			const isExpired = market.endTime && new Date(market.endTime) <= now;
			const marketType = market.cryptoMarketType;

			let verdict: 'YES' | 'NO' | null = null;
			let reason = '';

			if (marketType === 'TOUCH') {
				const isHit = ['gte', 'gt', 'eq'].includes(condition)
					? currentPrice >= targetValue
					: currentPrice <= targetValue;

				if (isHit) {
					verdict = 'YES';
					reason = `Price target reached! Current price: $${currentPrice}, Target: $${targetValue}`;
				} else if (isExpired) {
					verdict = 'NO';
					reason = `Market expired at ${market.endTime?.toISOString()}. Target was never reached. Final price: $${currentPrice}, Target: $${targetValue}`;
				}
			} else if (marketType === 'DIRECTION') {
				if (isExpired) {
					const startPrice = Number(market.startPrice) || 0;
					const isHit = ['gte', 'gt', 'eq'].includes(condition)
						? currentPrice >= startPrice
						: currentPrice <= startPrice;
					verdict = isHit ? 'YES' : 'NO';
					reason = `Direction resolved at expiry. Start price: $${startPrice}, Final price: $${currentPrice}. Condition: ${condition}`;
				}
			}

			if (verdict) {
				const acquiredMarket = await tryAcquireResolve(market.id);
				if (acquiredMarket) {
					await completeResolve(acquiredMarket, verdict, reason);
				} else {
					logger.info(
						{ marketId: market.id },
						'Could not acquire lock for resolution. Another process may be resolving it.',
					);
				}
			}
		}
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'cron',
				action: 'STOCKS_RESOLVER_TICK',
			},
		});
		logger.error({ error }, 'Error in checkAndResolveStocksMarkets cron');
	}
}

export function startStocksResolverCron() {
	logger.info('Starting Deterministic Stocks Resolver Cron (every 1 min)');
	cron.schedule('*/1 * * * *', async () => {
		await checkAndResolveStocksMarkets();
	});
}
