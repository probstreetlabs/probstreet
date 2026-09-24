import { logger } from '@/libs/logger';
import { setupSentry } from '@/libs/sentry';
import { initTelemetry } from '@/libs/opentelemetry';
import { startConsumer } from '@/libs/kafka/consumer';
import { connectProducer, disconnectProducer } from '@/libs/kafka/client';

initTelemetry('probstreet-processor-service');

async function startProcessor() {
	setupSentry();

	await connectProducer();
	await startConsumer();

	logger.info('Processor service is running and ready to process');

	process.on('SIGINT', async () => {
		await disconnectProducer();
		process.exit(0);
	});
}

startProcessor();
