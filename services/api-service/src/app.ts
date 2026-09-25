import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ENV } from '@/config/env';
import { logger } from 'hono/logger';
import * as Sentry from '@sentry/bun';
import { compress } from 'hono/compress';
import { swaggerUI } from '@hono/swagger-ui';
import { swaggerDocument } from '@/docs/swagger';
import { secureHeaders } from 'hono/secure-headers';
import {
	aapiRoutes,
	authRoutes,
	orderRoutes,
	healthRoutes,
	marketRoutes,
	paymentRoutes,
	profileRoutes,
	balanceRoutes,
	settingsRoutes,
	referralRoutes,
	portfolioRoutes,
	onboardingRoutes,
	categoriesRoutes,
	transactionRoutes,
	leaderboardRoutes,
	priceAlertsRoutes,
	verificationRoutes,
	notificationsRoutes,
} from '@/routes';

const app = new Hono();

app.use(logger());
app.use(
	cors({
		origin: ENV.CORS_ORIGIN.split(',').map((o) => o.trim()),
		allowHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		exposeHeaders: ['Content-Length', 'X-Custom-Header'],
		maxAge: 86400,
		credentials: true,
	}),
);
app.use(secureHeaders());
app.use(
	compress({
		encoding: 'gzip',
	}),
);

app.use('*', async (c, next) => {
	const user = c.get('jwtPayload') as any;

	await Sentry.withScope(async (scope) => {
		if (user && user.id) {
			scope.setUser({ id: user.id });
		}
		await next();
	});
});

// Swagger API Docs
app.get('/docs', swaggerUI({ url: '/docs/swagger.json' }));
app.get('/docs/swagger.json', (c) => c.json(swaggerDocument));

// Client APIs (CAPI)
app.route('/api/v1/capi/auth', authRoutes);
app.route('/api/v1/capi/order', orderRoutes);
app.route('/api/v1/capi/market', marketRoutes);
app.route('/api/v1/capi/balance', balanceRoutes);
app.route('/api/v1/capi/profile', profileRoutes);
app.route('/api/v1/capi/payments', paymentRoutes);
app.route('/api/v1/capi/settings', settingsRoutes);
app.route('/api/v1/capi/referral', referralRoutes);
app.route('/api/v1/capi/portfolio', portfolioRoutes);
app.route('/api/v1/capi/onboarding', onboardingRoutes);
app.route('/api/v1/capi/categories', categoriesRoutes);
app.route('/api/v1/capi/transaction', transactionRoutes);
app.route('/api/v1/capi/leaderboard', leaderboardRoutes);
app.route('/api/v1/capi/price-alerts', priceAlertsRoutes);
app.route('/api/v1/capi/verification', verificationRoutes);
app.route('/api/v1/capi/notifications', notificationsRoutes);

// Admin APIs (AAPI)
app.route('/api/v1/aapi', aapiRoutes);

// Health check APIs (PAPI)
app.route('/api/v1/papi/health', healthRoutes);

// Global Error Handler
app.onError((err, c) => {
	if (ENV.NODE_ENV !== 'development' && ENV.SENTRY_DSN) {
		const status = 'status' in err ? (err as any).status : 500;

		if (status >= 500) {
			Sentry.captureException(err);
		}
	}

	console.error(`[Error] ${err.message}`, err);

	const status = 'status' in err ? (err as any).status : 500;

	return c.json(
		{
			success: false,
			message: status >= 500 ? 'Internal Server Error' : err.message,
		},
		status as any,
	);
});

export default app;
