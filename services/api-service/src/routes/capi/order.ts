import { Hono } from 'hono';
import { requireScope } from '@/middlewares/scope';
import { orderLimiter } from '@/middlewares/limiter';
import { buy, sell, cancel } from '@/controllers/order';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';

export const orderRoutes = new Hono();

orderRoutes.post(
	'/buy',
	authorization,
	requireScope('orders:write'),
	orderLimiter,
	idempotency,
	buy,
);
orderRoutes.post(
	'/sell',
	authorization,
	requireScope('orders:write'),
	orderLimiter,
	idempotency,
	sell,
);
orderRoutes.post('/cancel', authorization, requireScope('orders:write'), orderLimiter, cancel);
