import * as Sentry from '@sentry/bun';
import { ENV } from '@/config/env';

export type SentryContext = {
	tags: {
		action: string;
		[key: string]: string | number | boolean | undefined;
	};
	contexts?: {
		[key: string]: Record<string, any>;
	};
};

export const setupSentry = () => {
	if (ENV.NODE_ENV === 'development' || !ENV.SENTRY_DSN) return;

	Sentry.init({
		dsn: ENV.SENTRY_DSN,
		environment: ENV.NODE_ENV,
		tracesSampleRate: 1.0,
	});
};

export const captureError = (error: unknown, context?: SentryContext | Record<string, any>) => {
	if (ENV.NODE_ENV === 'development' || !ENV.SENTRY_DSN) return;

	Sentry.withScope((scope) => {
		if (context) {
			if ('tags' in context || 'contexts' in context) {
				const typedContext = context as SentryContext;
				if (typedContext.tags) {
					scope.setTags(typedContext.tags);
				}
				if (typedContext.contexts) {
					Object.entries(typedContext.contexts).forEach(([key, value]) => {
						scope.setContext(key, value);
					});
				}
			} else {
				scope.setTags(context as Record<string, string>);
			}
		}

		if (error instanceof Error) {
			Sentry.captureException(error);
		} else {
			Sentry.captureMessage(String(error), 'error');
		}
	});
};
