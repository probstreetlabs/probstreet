import { ENV_CONFIG } from '@/config/env';
import { logger } from '@/libs/logger/logger';
import { sendEmail } from '@/libs/agentmail/client';
import { archiveFailedEmailHtml } from '@/libs/agentmail/templates/archive-failed';

export const handleArchiveFailed = async (env: ENV_CONFIG, data: any) => {
	try {
		const { symbol, error } = data;
		const html = archiveFailedEmailHtml(symbol, error || 'Unknown error');

		await sendEmail(
			env,
			env.ON_CALL_ENGINEER_MAIL,
			`ALERT: Engine Archival Failed for ${symbol}`,
			html,
		);

		logger.info({ symbol }, '[handler] Archive failed email sent to admin');
	} catch (err: any) {
		logger.error({ err: err.message }, '[handler] Failed to send archive-failed email');
	}
};
