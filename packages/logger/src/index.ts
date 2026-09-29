import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

const isDev = Bun.env.NODE_ENV !== 'production' && Bun.env.NODE_ENV !== 'staging';
const hasNewRelic = !!process.env.NEW_RELIC_API_KEY;

export const createLogger = (serviceName: string) => {
	console.log(
		`[Logger Init] New Relic enabled: ${hasNewRelic}, env: ${Bun.env.NODE_ENV}, service: ${serviceName}`,
	);
	const streams = [];

	if (isDev || !hasNewRelic) {
		const prettyStream = pino.transport({
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'yyyy-mm-dd HH:MM:ss.l',
				ignore: 'pid,hostname,trace_id,span_id,trace_flags',
				messageFormat: `[${serviceName}] {msg}`,
			},
		});
		streams.push({ stream: prettyStream });
	} else {
		streams.push({ stream: pino.destination(1) });
	}

	if (hasNewRelic) {
		const endpoint =
			(process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://otlp.eu01.nr-data.net:4318') +
			'/v1/logs';
		const apiKey = process.env.NEW_RELIC_API_KEY!;

		const otelStream = {
			write(msg: string) {
				try {
					const log = JSON.parse(msg);
					const levelNumMap: Record<string, number> = {
						trace: 9,
						debug: 13,
						info: 17,
						warn: 21,
						error: 25,
						fatal: 29,
					};
					const severityText = typeof log.level === 'string' ? log.level.toUpperCase() : 'INFO';
					const severityNumber =
						typeof log.level === 'string'
							? levelNumMap[log.level.toLowerCase()] || 17
							: Math.floor(log.level / 10) * 4 - 3;

					const traceId = log.trace_id;
					const spanId = log.span_id;

					delete log.trace_id;
					delete log.span_id;
					delete log.trace_flags;

					const record: any = {
						timeUnixNano: (log.time * 1000000).toString(),
						severityNumber,
						severityText,
						body: { stringValue: JSON.stringify(log) },
					};

					if (traceId) record.traceId = traceId;
					if (spanId) record.spanId = spanId;

					const payload = {
						resourceLogs: [
							{
								resource: {
									attributes: [{ key: 'service.name', value: { stringValue: serviceName } }],
								},
								scopeLogs: [{ logRecords: [record] }],
							},
						],
					};

					fetch(endpoint, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'api-key': apiKey,
						},
						body: JSON.stringify(payload),
					}).catch(() => {}); 
				} catch (e) {
				}
			},
		};
		streams.push({ stream: otelStream });
	}

	const stream = pino.multistream(streams);

	const pinoLogger = pino(
		{
			level: process.env.LOG_LEVEL || 'info',
			base: {
				service: serviceName,
			},
			formatters: {
				level(label) {
					return { level: label };
				},
			},
			mixin() {
				const span = trace.getSpan(context.active());
				if (!span) return {};
				const spanContext = span.spanContext();
				if (!spanContext) return {};
				return {
					trace_id: spanContext.traceId,
					span_id: spanContext.spanId,
					trace_flags: `0${spanContext.traceFlags.toString(16)}`,
				};
			},
		},
		stream,
	);

	return {
		info: pinoLogger.info.bind(pinoLogger),
		warn: pinoLogger.warn.bind(pinoLogger),
		error: pinoLogger.error.bind(pinoLogger),
		debug: pinoLogger.debug.bind(pinoLogger),
		child: pinoLogger.child.bind(pinoLogger),
	};
};
