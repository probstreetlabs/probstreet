import { ENV } from '@/config/env';
import { httpServer } from './app';
import { logger } from '@/libs/logger/logger';
import { captureError, setupSentry } from '@/libs/sentry';
import { startStreamSubscriber } from '@/libs/redis/subscriber';

async function startStreamService() {
	try {
		if (ENV.NODE_ENV === 'production' || ENV.NODE_ENV === 'staging') {
			setupSentry();
		}
		await startStreamSubscriber();

		httpServer.listen(ENV.PORT, () => {
			logger.info(`Stream service running on port ${ENV.PORT}`);
		});
	} catch (err) {
		if (ENV.NODE_ENV === 'production' || ENV.NODE_ENV === 'staging') {
			captureError(err);
		}
		logger.error('Failed to start stream service: ' + err);
		process.exit(1);
	}
}

startStreamService();
