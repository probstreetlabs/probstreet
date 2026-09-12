import { logger } from '@/libs/logger';
import { setupSentry } from '@/libs/sentry';
import { dbConsumer } from '@/libs/kafka/consumer';
import { connectProducer, disconnectProducer } from '@/libs/kafka/client';

async function startDBProcessor() {
	setupSentry();
	await connectProducer();

	logger.info('Processor service is running and ready to process');
	await dbConsumer();

	process.on('SIGINT', async () => {
		await disconnectProducer();
		process.exit(0);
	});
}

startDBProcessor();
