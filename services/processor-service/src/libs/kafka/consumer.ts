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

				let retryPayloadObj: any = {};
				try {
					retryPayloadObj = JSON.parse(rawValue);
				} catch (e) {}

				const currentRetryCount = retryPayloadObj.retryCount || 0;
				if (currentRetryCount >= 5) {
					logger.error(
						{ error, rawValue },
						'Message failed > 5 times. Pushing to DLQ and skipping.',
					);
					const errMessage = error instanceof Error ? error.message : String(error);
					await pushToDLQ(retryPayloadObj.type || 'UNKNOWN', retryPayloadObj, errMessage);
				} else {
					retryPayloadObj.retryCount = currentRetryCount + 1;
					const retryPayloadStr = JSON.stringify(retryPayloadObj);
					await produceToRetryTopic(retryPayloadStr);
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
