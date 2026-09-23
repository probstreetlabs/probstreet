import { ENV_CONFIG } from '@/config/env';
import { logger } from '@/libs/logger/logger';
import { getPrisma } from '@/libs/prisma/prisma';
import { handlePaymentEvent } from '@/handlers/payment';
import { handlePriceAlert } from '@/handlers/price-alert';
import { handleOracleReview } from '@/handlers/oracle-review';
import { handleMarketCreated } from '@/handlers/market-created';
import { handleTradeExecuted } from '@/handlers/trade-executed';
import { handleArchiveFailed } from '@/handlers/archive-failed';
import { handleOracleResolved } from '@/handlers/oracle-resolved';
import { handleMarketResolved } from '@/handlers/market-resolved';

export type NotificationEventTypes =
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

export interface NotificationEvent {
	type: NotificationEventTypes;
	data: Record<string, any>;
}

export async function routeEvent(env: ENV_CONFIG, event: NotificationEvent): Promise<void> {
	switch (event.type) {
		case 'market.created':
			await handleMarketCreated(env, getPrisma(env), event.data);
			break;
		case 'trade.executed':
			await handleTradeExecuted(env, getPrisma(env), event.data);
			break;
		case 'price.alert':
			await handlePriceAlert(env, getPrisma(env), event.data);
			break;
		case 'market.resolved':
			await handleMarketResolved(env, getPrisma(env), event.data);
			break;
		case 'archive.failed':
			await handleArchiveFailed(env, event.data);
			break;
		case 'oracle.review':
			await handleOracleReview(env, getPrisma(env), event.data);
			break;
		case 'oracle.resolved':
			await handleOracleResolved(env, getPrisma(env), event.data);
			break;
		case 'deposit.success':
		case 'deposit.failed':
		case 'withdrawal.success':
		case 'withdrawal.failed':
			await handlePaymentEvent(env, event.type, event.data);
			break;
		default:
			logger.warn(`[worker] Unknown event type: ${(event as any).type}`);
	}
}
