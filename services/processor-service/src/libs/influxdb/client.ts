import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';

const influxDB = new InfluxDB({
	url: ENV.INFLUX_URL,
	token: ENV.INFLUX_TOKEN,
});

export const writeApi = influxDB.getWriteApi(ENV.INFLUX_ORG, ENV.INFLUX_BUCKET, 'ms');

interface Candle {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

const candleBuffer: Record<string, Candle> = {};

// Flush candles every 10 seconds
setInterval(async () => {
	const now = Date.now();
	let pointsWritten = 0;

	for (const marketId in candleBuffer) {
		const candle = candleBuffer[marketId];
		// If the candle's minute is passed, write it and remove from buffer
		if (now > candle.timestamp + 60_000) {
			const point = new Point('trade_candles_1m')
				.tag('marketId', marketId)
				.floatField('open', candle.open)
				.floatField('high', candle.high)
				.floatField('low', candle.low)
				.floatField('close', candle.close)
				.floatField('volume', candle.volume)
				.timestamp(candle.timestamp);

			writeApi.writePoint(point);
			delete candleBuffer[marketId];
			pointsWritten++;
		}
	}

	if (pointsWritten > 0) {
		try {
			await writeApi.flush();
		} catch (error) {
			logger.error({ error }, 'Failed to flush InfluxDB writeApi');
		}
	}
}, 10_000);

export const recordTradeForCandle = (marketId: string, price: number, volume: number) => {
	const minuteTimestamp = Math.floor(Date.now() / 60000) * 60000;

	if (!candleBuffer[marketId] || candleBuffer[marketId].timestamp !== minuteTimestamp) {
		// Flush the old one immediately if it exists (rare)
		if (candleBuffer[marketId]) {
			const old = candleBuffer[marketId];
			const point = new Point('trade_candles_1m')
				.tag('marketId', marketId)
				.floatField('open', old.open)
				.floatField('high', old.high)
				.floatField('low', old.low)
				.floatField('close', old.close)
				.floatField('volume', old.volume)
				.timestamp(old.timestamp);
			writeApi.writePoint(point);
		}

		candleBuffer[marketId] = {
			timestamp: minuteTimestamp,
			open: price,
			high: price,
			low: price,
			close: price,
			volume: volume,
		};
	} else {
		const c = candleBuffer[marketId];
		c.high = Math.max(c.high, price);
		c.low = Math.min(c.low, price);
		c.close = price;
		c.volume += volume;
	}
};
