import { ENV } from '@/config/env';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export const initTelemetry = (serviceName: string) => {
	if (ENV.NODE_ENV === 'development' || !ENV.NEW_RELIC_API_KEY) {
		return;
	}

	const headers = { 'api-key': ENV.NEW_RELIC_API_KEY };
	const baseUrl = ENV.OTEL_EXPORTER_OTLP_ENDPOINT;

	const sdk = new NodeSDK({
		resource: resourceFromAttributes({
			[ATTR_SERVICE_NAME]: serviceName,
			[ATTR_SERVICE_VERSION]: process.env.SENTRY_RELEASE || '1.0',
		}),
		traceExporter: new OTLPTraceExporter({
			url: `${baseUrl}/v1/traces`,
			headers,
		}),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter({
				url: `${baseUrl}/v1/metrics`,
				headers,
			}),
			exportIntervalMillis: 10000,
		}),
		logRecordProcessor: new SimpleLogRecordProcessor({
			exporter: new OTLPLogExporter({
				url: `${baseUrl}/v1/logs`,
				headers,
			}),
		}),
		instrumentations: [
			getNodeAutoInstrumentations({
				'@opentelemetry/instrumentation-fs': { enabled: false },
				'@opentelemetry/instrumentation-net': { enabled: false },
			}),
		],
	});

	sdk.start();

	process.on('SIGTERM', () => {
		sdk
			.shutdown()
			.then(() => console.log('Telemetry terminated'))
			.catch((error) => console.log('Error terminating telemetry', error))
			.finally(() => process.exit(0));
	});
};
