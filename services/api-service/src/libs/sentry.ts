import { ENV } from '@/config/env';
import * as Sentry from '@sentry/bun';

export const setupSentry = () => {
	if (ENV.NODE_ENV === 'development' || !ENV.SENTRY_DSN) {
		return;
	}

	Sentry.init({
		dsn: ENV.SENTRY_DSN,
		environment: ENV.NODE_ENV,
		tracesSampleRate: ENV.NODE_ENV === 'production' ? 0.1 : 1.0,
	});

	process.on('unhandledRejection', (reason) => {
		Sentry.captureException(reason);
	});

	process.on('uncaughtException', (error) => {
		Sentry.captureException(error);
		Sentry.flush(2000).finally(() => process.exit(1));
	});
};

export type SentryContext = {
	tags: {
		controller: string;
		action: string;
		provider?: string;
		userId?: string;
		marketId?: string;
		orderId?: string;
		symbol?: string;
	};
	contexts?: {
		[key: string]: any;
	};
};

export const captureError = (error: unknown, context?: SentryContext | Record<string, any>) => {
	if (ENV.NODE_ENV === 'development' || !ENV.SENTRY_DSN) return;

	Sentry.withScope((scope) => {
		if (context) {
			if ('tags' in context || 'contexts' in context) {
				const ctx = context as SentryContext;
				if (ctx.tags) scope.setTags(ctx.tags);
				if (ctx.contexts) {
					for (const [key, value] of Object.entries(ctx.contexts)) {
						scope.setContext(key, value);
					}
				}
			} else {
				// Fallback for older unstructured calls
				scope.setExtras(context as Record<string, any>);
			}
		}
		Sentry.captureException(error);
	});
};
