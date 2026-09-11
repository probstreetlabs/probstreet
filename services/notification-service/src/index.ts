import { logger } from '@/libs/logger/logger';
import { ENV_CONFIG, validateEnv } from '@/config/env';
import { processEvent, NotificationEvent } from '@/router';

export default {
	async queue(batch: MessageBatch<NotificationEvent>, env: ENV_CONFIG): Promise<void> {
		const validEnv = validateEnv(env);

		for (const message of batch.messages) {
			try {
				await processEvent(validEnv, message.body);
				message.ack();
			} catch (err) {
				logger.error(`[queue] Failed to process message: ` + err);
				message.retry();
			}
		}
	},
};
