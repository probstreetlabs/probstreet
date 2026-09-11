import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';

type NotificationEventType =
	| 'otp.send'
	| 'market.created'
	| 'trade.executed'
	| 'price.alert'
	| 'oracle.review'
	| 'oracle.resolved'
	| 'deposit.success'
	| 'deposit.failed'
	| 'withdrawal.success'
	| 'withdrawal.failed';

interface NotificationEvent {
	type: NotificationEventType;
	data: Record<string, any>;
}

export const sendNotification = async (event: NotificationEvent): Promise<void> => {
	const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_QUEUE_ID, CLOUDFLARE_API_TOKEN } = ENV;

	if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_QUEUE_ID || !CLOUDFLARE_API_TOKEN) {
		logger.warn(
			{ event: event.type },
			'Cloudflare Queue credentials not set, skipping notification',
		);
		return;
	}

	try {
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/queues/${CLOUDFLARE_QUEUE_ID}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify([{ body: event }]),
				signal: AbortSignal.timeout(3000),
			},
		);

		if (!response.ok) {
			const text = await response.text();
			logger.warn(
				{
					status: response.status,
					body: text,
					event: event.type,
				},
				'Cloudflare Queue API returned non-OK response',
			);
		} else {
			logger.info(
				{
					event: event.type,
				},
				'Notification event dispatched to Cloudflare Queue',
			);
		}
	} catch (err: any) {
		captureError(err, {
			tags: {
				controller: 'notification_dispatcher',
				action: 'SEND_NOTIFICATION',
				eventType: event.type,
			},
		});
		logger.error(
			{ error: err.message, event: event.type },
			'Failed to dispatch notification to Queue (swallowed)',
		);
	}
};
