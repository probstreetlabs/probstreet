import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Dispatcher (Processor Service)
//
// Identical to the API service dispatcher — a fire-and-forget HTTP call
// to the Cloudflare Notification Worker. Errors are swallowed so notification
// failures never crash the Kafka processor.
// ─────────────────────────────────────────────────────────────────────────────

type NotificationEventType =
	| 'market.created'
	| 'trade.executed'
	| 'price.alert'
	| 'market.resolved'
	| 'archive.failed'
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

	if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_QUEUE_ID || !CLOUDFLARE_API_TOKEN) return;

	try {
		await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/queues/${CLOUDFLARE_QUEUE_ID}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ body: event }),
			},
		);

		logger.info({ event: event.type }, 'Notification event dispatched to Cloudflare Queue');
	} catch (err: any) {
		logger.error(
			{ error: err.message, event: event.type },
			'Failed to dispatch notification to Queue (swallowed)',
		);
	}
};
