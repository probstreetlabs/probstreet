import { ENV_CONFIG } from '@/config/env';
import { AgentMailClient } from 'agentmail';
import { logger } from '@/libs/logger/logger';

export async function sendEmail(env: ENV_CONFIG, to: string, subject: string, html: string) {
	const client = new AgentMailClient({
		apiKey: env.AGENTMAIL_API_KEY,
	});

	try {
		const response = await client.inboxes.messages.send(env.AGENTMAIL_INBOX, {
			to,
			subject,
			html,
		});

		logger.info({ to, subject }, '[agentmail] Email sent successfully');
		return response;
	} catch (error: any) {
		logger.error(
			{ to, subject, error: error?.message ?? String(error) },
			'[agentmail] Failed to send email',
		);
		throw error;
	}
}
