import { consumer } from './client';
import { routeEvent } from '@/router';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { initDLQTable, pushToDLQ } from '@/libs/dlq';
import { produceToRetryTopic } from './retryProducer';
import { KafkaMessageSchema } from '@/validations/kafka';

export const startConsumer = async () => {
	await initDLQTable();
	await consumer.connect();
	await consumer.subscribe({ topics: ['process_db', 'process_db_retry'], fromBeginning: true });

	await consumer.run({
		autoCommit: false,
		eachMessage: async ({ topic, partition, message }) => {
			if (!message.value) return;

			const rawValue = message.value.toString();

			try {
				const event = JSON.parse(rawValue);
				const parsedEvent = KafkaMessageSchema.parse(event);

				const eventType: string = parsedEvent.type;
				const eventData: unknown = parsedEvent.data;

				await routeEvent(eventType, eventData);

				await consumer.commitOffsets([
					{ topic, partition, offset: (Number(message.offset) + 1).toString() },
				]);
			} catch (error) {
				captureError(error, {
					tags: { controller: 'kafka_consumer', action: 'PROCESS_MESSAGE' },
					contexts: { kafka: { message: rawValue } },
				});
				logger.error(
					{ error, rawValue },
					'DB update failed or validation error, sending to retry topic',
				);

				const currentRetryCount = parseInt(message.headers?.retryCount?.toString() || '0', 10);

				if (currentRetryCount >= 5) {
					logger.error(
						{ error, rawValue },
						'Message failed > 5 times. Pushing to DLQ and skipping.',
					);
					const errMessage = error instanceof Error ? error.message : String(error);

					let eventType = 'UNKNOWN';
					let payloadObj = { raw: rawValue };
					try {
						const parsed = JSON.parse(rawValue);
						eventType = parsed.type || 'UNKNOWN';
						payloadObj = parsed;
					} catch (e) {}

					await pushToDLQ(eventType, payloadObj, errMessage);
				} else {
					await produceToRetryTopic(rawValue, currentRetryCount + 1);
				}

				await consumer.commitOffsets([
					{ topic, partition, offset: (Number(message.offset) + 1).toString() },
				]);
			}
		},
	});

	process.on('SIGINT', async () => {
		await consumer.disconnect();
		logger.info('Consumer disconnected');
		process.exit();
	});
};
