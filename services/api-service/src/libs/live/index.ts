import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { client as redis } from '@/libs/redis/connection';

const CRYPTO_LOGOS: Record<string, { name: string; logo: string }> = {
	BTC: {
		name: 'Bitcoin',
		logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
	},
	ETH: {
		name: 'Ethereum',
		logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
	},
	SOL: {
		name: 'Solana',
		logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
	},
	XRP: {
		name: 'XRP',
		logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
	},
	DOGE: {
		name: 'Dogecoin',
		logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
	},
	BNB: {
		name: 'BNB',
		logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
	},
	ADA: {
		name: 'Cardano',
		logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
	},
	AVAX: {
		name: 'Avalanche',
		logo: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
	},
	LINK: {
		name: 'Chainlink',
		logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
	},
	DOT: {
		name: 'Polkadot',
		logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
	},
};

function detectCryptoCoin(title: string, symbol: string): string | null {
	const text = `${title} ${symbol}`.toUpperCase();
	for (const coin of Object.keys(CRYPTO_LOGOS)) {
		if (
			text.includes(coin) ||
			(coin === 'BTC' && text.includes('BITCOIN')) ||
			(coin === 'ETH' && text.includes('ETHEREUM')) ||
			(coin === 'SOL' && text.includes('SOLANA')) ||
			(coin === 'DOGE' && text.includes('DOGECOIN'))
		) {
			return coin;
		}
	}
	return null;
}

async function _fetchLiveMarketData(market: any): Promise<any> {
	const categoryName = market.category?.categoryName?.toLowerCase() || '';
	const title = market.title || '';
	const oracleConfig = (market.oracleConfig as any) || {};

	const yesProb = Math.round((Number(market.yesPrice) / 10) * 100) || 50;
	const noProb = 100 - yesProb;
	const defaultOdds = {
		yes: Number(market.yesPrice),
		no: Number(market.noPrice),
		yesProbability: yesProb,
		noProbability: noProb,
	};

	// 1. Check if it is a Crypto Market
	let coinFromSource = null;
	if (market.sourceOfTruth?.includes('api.binance.com')) {
		const match = market.sourceOfTruth.match(/symbol=([A-Z]+)USDT/);
		if (match) coinFromSource = match[1];
	}

	const coin = coinFromSource || detectCryptoCoin(title, market.symbol);
	const isCryptoCategory =
		categoryName.includes('crypto') ||
		categoryName.includes('bitcoin') ||
		categoryName.includes('ethereum') ||
		oracleConfig.resolver === 'crypto_price' ||
		!!coin;

	const effectiveCoin = coin || (isCryptoCategory ? 'BTC' : null);

	if (isCryptoCategory || effectiveCoin) {
		try {
			const binancePair = `${effectiveCoin}USDT`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 4000);

			const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binancePair}`, {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (res.ok) {
				const data = (await res.json()) as any;
				const currentPrice = parseFloat(data.lastPrice);
				const priceChangePercent = parseFloat(data.priceChangePercent);
				const highPrice = parseFloat(data.highPrice);
				const lowPrice = parseFloat(data.lowPrice);
				const coinInfo = CRYPTO_LOGOS[coin] || {
					name: coin,
					logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
				};

				return {
					type: 'CRYPTO',
					isLive: market.status === 'OPEN',
					status: market.status,
					title: market.title,
					crypto: {
						coin: effectiveCoin,
						name: coinInfo.name,
						symbol: binancePair,
						price: currentPrice,
						change24h: priceChangePercent,
						high24h: highPrice,
						low24h: lowPrice,
						targetValue: oracleConfig.targetValue ? Number(oracleConfig.targetValue) : undefined,
						targetCondition: oracleConfig.condition,
						logoUrl: coinInfo.logo,
					},
					odds: defaultOdds,
				};
			}
		} catch (err: any) {
			logger.warn(
				{ coin: effectiveCoin, err: err.message },
				'Failed to fetch Binance crypto live ticker',
			);
		}
	}

	// 2. Check if it is a Football / Sports Market with an API Source of Truth
	if (market.sourceOfTruth && market.sourceOfTruth.startsWith('http')) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 4000);

			const headers: Record<string, string> = {
				Accept: 'application/json',
			};
			const config = market.oracleConfig as any;

			if (market.sourceOfTruth.includes('football-data.org') && ENV.FOOTBALL_DATA_API_KEY) {
				headers['X-Auth-Token'] = ENV.FOOTBALL_DATA_API_KEY;
			}

			const res = await fetch(market.sourceOfTruth, {
				headers,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
				const json = (await res.json()) as any;

				// Parse Football-Data.org response
				const homeTeam =
					json.homeTeam?.name || json.home?.name || json.team1 || json.matches?.[0]?.team1 || '';
				const awayTeam =
					json.awayTeam?.name || json.away?.name || json.team2 || json.matches?.[0]?.team2 || '';
				const homeShort = json.homeTeam?.shortName || json.homeTeam?.tla || homeTeam;
				const awayShort = json.awayTeam?.shortName || json.awayTeam?.tla || awayTeam;
				const homeCrest = json.homeTeam?.crest || json.home?.crest || json.homeTeam?.logo || '';
				const awayCrest = json.awayTeam?.crest || json.away?.crest || json.awayTeam?.logo || '';

				const scoreHome =
					json.score?.fullTime?.home ??
					json.score?.home ??
					json.score1 ??
					json.matches?.[0]?.score?.ft?.[0] ??
					0;
				const scoreAway =
					json.score?.fullTime?.away ??
					json.score?.away ??
					json.score2 ??
					json.matches?.[0]?.score?.ft?.[1] ??
					0;

				const rawStatus = (json.status || json.state || '').toUpperCase();
				let normalizedStatus = 'LIVE';
				if (rawStatus === 'IN_PLAY' || rawStatus === 'LIVE') normalizedStatus = 'LIVE';
				else if (rawStatus === 'PAUSED' || rawStatus === 'HT') normalizedStatus = 'HT';
				else if (rawStatus === 'FINISHED' || rawStatus === 'FT') normalizedStatus = 'FINISHED';
				else if (rawStatus === 'TIMED' || rawStatus === 'SCHEDULED') normalizedStatus = 'UPCOMING';

				const minute =
					json.minute || json.matchTime || (normalizedStatus === 'HT' ? 'Half Time' : undefined);

				if (homeTeam && awayTeam) {
					return {
						type: 'SPORTS',
						isLive: normalizedStatus === 'LIVE' || normalizedStatus === 'HT',
						status: normalizedStatus,
						title: market.title,
						match: {
							sport: 'football',
							league: json.competition?.name || 'Football Match',
							minute,
							startTime: config?.scheduledStartTime,
							homeTeam: {
								name: homeTeam,
								shortName: homeShort,
								crest: homeCrest,
								score: scoreHome,
							},
							awayTeam: {
								name: awayTeam,
								shortName: awayShort,
								crest: awayCrest,
								score: scoreAway,
							},
						},
						targetOutcome: config?.condition,
						odds: defaultOdds,
					};
				}
			}
		} catch (sportsErr: any) {
			logger.warn(
				{ symbol: market.symbol, err: sportsErr.message },
				'Failed to fetch sports match feed',
			);
		}
	}

	// 3. Check if it is a STOCKS Market
	if (
		categoryName.includes('stocks') ||
		categoryName.includes('finance') ||
		oracleConfig.resolver === 'stock_price'
	) {
		try {
			if (ENV.FINNHUB_API_KEY) {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 4000);

				let finnhubSymbol = 'AAPL'; // default fallback
				if (market.sourceOfTruth?.includes('finnhub.io')) {
					const urlObj = new URL(market.sourceOfTruth);
					finnhubSymbol = urlObj.searchParams.get('symbol') || finnhubSymbol;
				} else {
					// Fallback: try to extract from title (e.g. "Will TSLA go up?")
					const match = title.match(/\b([A-Z]{2,5}(?:\.[A-Z]{2})?)\b/);
					if (match) finnhubSymbol = match[1];
				}

				const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${ENV.FINNHUB_API_KEY}`;

				const res = await fetch(url, { signal: controller.signal });
				clearTimeout(timeoutId);

				if (res.ok) {
					const data = (await res.json()) as any;
					if (data && data.c !== 0 && data.c !== undefined) {
						return {
							type: 'STOCKS',
							isLive: market.status === 'OPEN',
							status: market.status,
							title: market.title,
							stock: {
								symbol: finnhubSymbol,
								price: data.c,
								change: data.d,
								changePercent: data.dp,
								high: data.h,
								low: data.l,
								targetValue: oracleConfig.targetValue
									? Number(oracleConfig.targetValue)
									: undefined,
								targetCondition: oracleConfig.condition,
							},
							odds: defaultOdds,
						};
					}
				}
			}
		} catch (err: any) {
			logger.warn(
				{ symbol: market.symbol, err: err.message },
				'Failed to fetch Finnhub live ticker',
			);
		}
	}

	// 4. Check if it is a Football / Sports Market title-based match
	const isSports =
		categoryName.includes('sport') ||
		categoryName.includes('football') ||
		categoryName.includes('cricket') ||
		title.toLowerCase().includes(' vs ');

	if (isSports && title.toLowerCase().includes(' vs ')) {
		const parts = title.split(/ vs /i);
		const home =
			parts[0]
				?.replace(/^will\s+/i, '')
				.replace(/defeat|beat|win/i, '')
				.trim() || 'Team A';
		const away = parts[1]?.split(/\s+in|\s+on|\?/i)[0]?.trim() || 'Team B';

		return {
			type: 'SPORTS',
			isLive: market.status === 'OPEN',
			status: market.status === 'OPEN' ? 'LIVE' : 'CLOSED',
			title: market.title,
			match: {
				sport: 'sports',
				league: categoryName || 'Live Match',
				homeTeam: {
					name: home,
					shortName: home.split(' ')[0] || home,
					score: 0,
				},
				awayTeam: {
					name: away,
					shortName: away.split(' ')[0] || away,
					score: 0,
				},
			},
			odds: defaultOdds,
		};
	}

	// 4. General Live Market representation
	return {
		type: 'GENERAL',
		isLive: market.status === 'OPEN',
		status: market.status === 'OPEN' ? 'LIVE' : 'CLOSED',
		title: market.title,
		category: market.category?.categoryName || 'General',
		odds: defaultOdds,
	};
}

export async function fetchLiveMarketData(market: any): Promise<any> {
	if (!market || !market.symbol) return _fetchLiveMarketData(market);

	const cacheKey = `market:live:${market.symbol}`;
	try {
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}
	} catch (e: any) {
		logger.warn({ error: e.message }, 'Live market cache read error');
	}

	const result = await _fetchLiveMarketData(market);

	try {
		if (result) {
			// Cache for 10 seconds to throttle heavy loads
			await redis.set(cacheKey, JSON.stringify(result), 'EX', 10);
		}
	} catch (e: any) {
		logger.warn({ error: e.message }, 'Live market cache write error');
	}

	return result;
}
