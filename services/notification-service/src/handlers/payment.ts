import { ENV_CONFIG } from '@/config/env';
import { logger } from '@/libs/logger/logger';
import { sendEmail } from '@/libs/agentmail/client';

export async function handlePaymentEvent(
	env: ENV_CONFIG,
	eventType: 'deposit.success' | 'deposit.failed' | 'withdrawal.success' | 'withdrawal.failed',
	data: any,
) {
	const { email, amount, reason } = data;

	if (!email) {
		logger.warn(`[worker] Missing email for payment event: ${eventType}`);
		return;
	}

	let subject = '';

	switch (eventType) {
		case 'deposit.success':
			subject = `Deposit Successful - Probstreet`;
			break;
		case 'deposit.failed':
			subject = `Deposit Failed - Probstreet`;
			break;
		case 'withdrawal.success':
			subject = `Withdrawal Successful - Probstreet`;
			break;
		case 'withdrawal.failed':
			subject = `Withdrawal Failed - Probstreet`;
			break;
		default:
			return;
	}

	const { paymentEmailHtml } = await import('@/libs/agentmail/templates/payment');
	const html = paymentEmailHtml(eventType, amount, reason);

	await sendEmail(env, email, subject, html);
	logger.info(`[worker] Payment notification sent for ${eventType} to ${email}`);
}
