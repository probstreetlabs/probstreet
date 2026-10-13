import { Hono } from 'hono';
import { requireScope } from '@/middlewares/scope';
import { buy, sell, cancel } from '@/controllers/order';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';

export const orderRoutes = new Hono();

orderRoutes.post('/buy', authorization, requireScope('orders:write'), idempotency, buy);
orderRoutes.post('/sell', authorization, requireScope('orders:write'), idempotency, sell);
orderRoutes.post('/cancel', authorization, requireScope('orders:write'), cancel);
